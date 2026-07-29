import { updateTask } from '../../utils/task-repository'
import { parseTaskDraft } from '../../utils/task-request'

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'id')

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task id is required.',
    })
  }

  const body = await readBody<unknown>(event)
  const draft = parseTaskDraft(body)

  await new Promise((resolve) => setTimeout(resolve, 300))

  const task = updateTask(taskId, draft)

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found.',
    })
  }

  return task
})
