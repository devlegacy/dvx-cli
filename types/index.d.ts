declare module 'htmlhint-stylish' {
  export default function htmlHintStylish(options: { cwd: string; htmlhint: { messages: unknown[] } }): string
}
