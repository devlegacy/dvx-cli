export function chunkArray<T>(array: T[], workerCount: number): T[][] {
  const length = array.length
  const chunkSize = Math.floor(length / workerCount)
  const remainder = length % workerCount
  const chunks = []
  let start = 0

  for (let i = 0; i < workerCount; i++) {
    const end = start + chunkSize + (i < remainder ? 1 : 0)
    chunks.push(array.slice(start, end))
    start = end
  }

  return chunks
}
