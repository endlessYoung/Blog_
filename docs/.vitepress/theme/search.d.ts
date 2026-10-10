declare module '@localSearchIndex' {
  const data: Record<string, () => Promise<{ default: string }>>
  export default data
}

declare module 'vitepress/dist/client/app/utils.js' {
  export function pathToFile(path: string): string | null
  export const inBrowser: boolean
}
