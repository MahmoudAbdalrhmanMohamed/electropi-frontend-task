import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Task } from '../app/types/task'
import { useTasksStore } from '../app/stores/tasks'

const sampleTasks: Task[] = [
  {
    id: 'task-one',
    title: 'Write launch checklist',
    description: 'Capture the remaining launch steps.',
    status: 'pending',
    dueDate: '2099-02-01',
    createdAt: '2099-01-01T09:00:00.000Z',
    updatedAt: '2099-01-01T09:00:00.000Z',
  },
  {
    id: 'task-two',
    title: 'Review dashboard',
    description: 'Review the final responsive layout.',
    status: 'done',
    dueDate: '2099-02-02',
    createdAt: '2099-01-01T10:00:00.000Z',
    updatedAt: '2099-01-01T10:00:00.000Z',
  },
  {
    id: 'task-three',
    title: 'Launch dashboard',
    description: 'Publish the approved dashboard.',
    status: 'in-progress',
    dueDate: '2099-02-03',
    createdAt: '2099-01-01T11:00:00.000Z',
    updatedAt: '2099-01-01T11:00:00.000Z',
  },
]

describe('tasks store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('combines title search and status filtering', () => {
    const store = useTasksStore()
    store.tasks = [...sampleTasks]
    store.searchQuery = 'dashboard'
    store.statusFilter = 'in-progress'

    expect(store.filteredTasks.map((task) => task.id)).toEqual(['task-three'])
    expect(store.counts).toEqual({
      total: 3,
      pending: 1,
      inProgress: 1,
      done: 1,
    })
  })

  it('replaces the list and upserts individual tasks', () => {
    const store = useTasksStore()
    const updatedTask: Task = {
      ...sampleTasks[0]!,
      title: 'Updated launch checklist',
    }

    store.replaceTasks(sampleTasks.slice(0, 2))
    store.upsertTask(updatedTask)
    store.upsertTask(sampleTasks[2]!)

    expect(store.hasLoadedList).toBe(true)
    expect(store.tasks).toEqual([sampleTasks[2], updatedTask, sampleTasks[1]])
  })

  it('creates, updates, and deletes tasks through the REST API', async () => {
    const store = useTasksStore()
    const createdTask: Task = {
      id: 'task-created-by-api',
      title: 'Prepare demo',
      description: 'Confirm the main user flow.',
      status: 'pending',
      dueDate: '2099-04-10',
      createdAt: '2099-04-01T09:00:00.000Z',
      updatedAt: '2099-04-01T09:00:00.000Z',
    }
    const updatedTask: Task = {
      ...createdTask,
      title: 'Prepare final demo',
      description: 'Confirm the polished user flow.',
      status: 'done',
      dueDate: '2099-04-12',
      updatedAt: '2099-04-02T09:00:00.000Z',
    }
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(createdTask)
      .mockResolvedValueOnce(updatedTask)
      .mockResolvedValueOnce({ id: createdTask.id, deleted: true })

    vi.stubGlobal('$fetch', fetchMock)

    const created = await store.createTask({
      title: '  Prepare demo  ',
      description: '  Confirm the main user flow.  ',
      status: 'pending',
      dueDate: '2099-04-10',
    })

    expect(created.title).toBe('Prepare demo')
    expect(created.description).toBe('Confirm the main user flow.')
    expect(store.tasks).toHaveLength(1)

    const updated = await store.updateTask(created.id, {
      title: 'Prepare final demo',
      description: 'Confirm the polished user flow.',
      status: 'done',
      dueDate: '2099-04-12',
    })

    expect(updated.status).toBe('done')
    expect(store.completionRate).toBe(100)
    await expect(store.deleteTask(created.id)).resolves.toBe(true)
    expect(store.tasks).toHaveLength(0)
    expect(fetchMock).toHaveBeenNthCalledWith(1, '/api/tasks', {
      method: 'POST',
      body: {
        title: 'Prepare demo',
        description: 'Confirm the main user flow.',
        status: 'pending',
        dueDate: '2099-04-10',
      },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(2, `/api/tasks/${created.id}`, {
      method: 'PUT',
      body: {
        title: 'Prepare final demo',
        description: 'Confirm the polished user flow.',
        status: 'done',
        dueDate: '2099-04-12',
      },
    })
    expect(fetchMock).toHaveBeenNthCalledWith(3, `/api/tasks/${created.id}`, {
      method: 'DELETE',
    })
  })

  it('moves a task between board columns through the update API', async () => {
    const store = useTasksStore()
    store.tasks = [...sampleTasks]
    const movedTask: Task = {
      ...sampleTasks[0]!,
      status: 'in-progress',
      updatedAt: '2099-01-02T09:00:00.000Z',
    }
    const fetchMock = vi.fn().mockResolvedValue(movedTask)

    vi.stubGlobal('$fetch', fetchMock)

    const moved = await store.changeTaskStatus('task-one', 'in-progress')

    expect(moved?.status).toBe('in-progress')
    expect(moved?.updatedAt).not.toBe(sampleTasks[0]?.updatedAt)
    expect(store.counts).toEqual({
      total: 3,
      pending: 0,
      inProgress: 2,
      done: 1,
    })
    expect(fetchMock).toHaveBeenCalledWith('/api/tasks/task-one', {
      method: 'PUT',
      body: {
        title: sampleTasks[0]?.title,
        description: sampleTasks[0]?.description,
        status: 'in-progress',
        dueDate: sampleTasks[0]?.dueDate,
      },
    })
  })

  it('exposes API mutation errors without changing local tasks', async () => {
    const store = useTasksStore()
    const apiError = {
      data: {
        statusMessage: 'Task validation failed.',
      },
    }

    vi.stubGlobal('$fetch', vi.fn().mockRejectedValue(apiError))

    await expect(
      store.createTask({
        title: 'Prepare demo',
        description: '',
        status: 'pending',
        dueDate: '2099-04-10',
      }),
    ).rejects.toBe(apiError)

    expect(store.tasks).toHaveLength(0)
    expect(store.mutationError).toBe('Task validation failed.')
    expect(store.isMutating).toBe(false)
  })
})
