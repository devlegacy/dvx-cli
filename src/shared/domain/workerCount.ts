import { cpus } from 'node:os'

// One worker per core, minus one left for the main thread; never more workers than items
export const workerCountFor = (items: number) => Math.max(1, Math.min(cpus().length - 1, items))

// Share the cores between workers: libvips (sharp) would otherwise start a thread pool of
// its own in every worker, so workers × threads would exceed the core count
export const sharpThreadsFor = (workers: number) => Math.max(1, Math.floor(cpus().length / workers))
