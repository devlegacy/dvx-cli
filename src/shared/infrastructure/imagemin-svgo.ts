import { Buffer } from 'node:buffer'
import isSvg from 'is-svg'
import { optimize, type Config } from 'svgo'

const imageminSvgo = (options: Config) => async (buffer: unknown) => {
  options = {
    multipass: true,
    ...options,
  }

  if (Buffer.isBuffer(buffer)) {
    buffer = buffer.toString()
  }

  if (typeof buffer === 'string' && !isSvg(buffer)) {
    return buffer
  }

  const { data } = optimize(buffer as string, options)
  return Buffer.from(data)
}

export default imageminSvgo
