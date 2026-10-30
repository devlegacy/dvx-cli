import { isMainThread } from 'node:worker_threads'

// A job that cannot start: every worker dies before it ever asks for work
if (!isMainThread) process.exit(1)
