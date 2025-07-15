import type { Class } from 'type-fest'
import { isFunction } from './isFunction.js'

export const isConstructor = <T = unknown>(value: unknown): value is Class<T> =>
  isFunction(value) &&
  !!value?.name &&
  !!value?.prototype &&
  value?.prototype?.constructor === value
