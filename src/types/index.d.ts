export interface ThemeConfig {
  site: {
    title: string
    subtitle: string
    author: string
    description: string
    url: string
  }
  global: {
    fontStyle: 'sans' | 'serif'
    dateFormat: 'YYYY-MM-DD' | 'MM-DD-YYYY' | 'DD-MM-YYYY' | 'MONTH DAY YYYY' | 'DAY MONTH YYYY'
    toc: boolean
    katex: boolean
    reduceMotion: boolean
  }
  color: {
    mode: 'light' | 'dark' | 'auto'
    light: {
      primary: string
      secondary: string
      background: string
      highlight: string
    }
    dark: {
      primary: string
      secondary: string
      background: string
      highlight: string
    }
  }
  footer: {
    links: {
      name: string
      url: string
    }[]
    startYear: number
  }
}
