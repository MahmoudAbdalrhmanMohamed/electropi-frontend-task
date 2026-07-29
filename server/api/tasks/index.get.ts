import { listTasks } from '../../utils/task-repository'

export default defineEventHandler(async () => {
  await new Promise((resolve) => setTimeout(resolve, 850))

  return listTasks()
})
