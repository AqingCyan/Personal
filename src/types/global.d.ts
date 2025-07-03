import type { AttributifyAttributes } from '@unocss/preset-attributify'

declare global {
  namespace astroHTML.JSX {
    interface HTMLAttributes extends AttributifyAttributes {}
  }

  interface Window {
    getRouteHistory?: () => string[]
  }
}

export {}
