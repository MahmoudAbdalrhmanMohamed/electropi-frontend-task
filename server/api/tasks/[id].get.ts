import { findTask } from '../../utils/task-repository'

export default defineEventHandler(async (event) => {
  const taskId = getRouterParam(event, 'id')

  if (!taskId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Task id is required.',
    })
  }

  await new Promise((resolve) => setTimeout(resolve, 250))

  const task = findTask(taskId)

  if (!task) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Task not found.',
    })
  }

  return task
})
