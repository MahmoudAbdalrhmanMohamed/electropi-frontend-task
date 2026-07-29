import { deleteTask } from '../../utils/task-repository'

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'id')

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task id is required.',
    })
  }

  await new Promise((resolve) => setTimeout(resolve, 300))

  if (!deleteTask(taskId)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found.',
    })
  }

  return {
    id: taskId,
    deleted: true as const,
  }
})
