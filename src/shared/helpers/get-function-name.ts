const findFirstOccurrence = (string: string, searchElements: Array<any>, fromIndex: number = 0) => {
  let min = string.length
  for (let i = 0; i < searchElements.length; i += 1) {
    const occ = string.indexOf(searchElements[i], fromIndex)
    if (occ !== -1 && occ < min) {
      min = occ
    }
  }
  return min === string.length ? -1 : min
}
/**
 * [NodeJS] Get the current function name or any other function while using strict mode
 * Read more on: https://gist.github.com/gurisko/2e6936ea6679afd2d313fdbdf0a18b00
 * @param func
 */
export const getFunctionName = (func: any = null): string => {
  if (func) {
    if (func.name) {
      return func.name
    }
    const result = /^function\s+([\w\$]+)\s*\(/.exec(func.toString())

    return result ? result[1] : ''
  }

  const error: { [key: string]: string } = {
    stack: '',
  }
  Error.captureStackTrace(error, getFunctionName)
  const { stack } = error
  // console.log(error, stack);

  const firstCharacter: number = stack.indexOf('at ') + 3
  const lastCharacter: number = findFirstOccurrence(stack, [' ', ':', '\n'], firstCharacter)
  return stack.slice(firstCharacter, lastCharacter)
}
