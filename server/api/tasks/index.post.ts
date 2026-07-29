import { createTask } from '../../utils/task-repository'
import { parseTaskDraft } from '../../utils/task-request'

export default defineEventHandler(async (event) => {
  const body = await readBody<unknown>(event)
  const draft = parseTaskDraft(body)

  await new Promise((resolve) => setTimeout(resolve, 300))
  event.node.res.statusCode = 201

  return createTask(draft)
})
