import type { ThemeConfig } from '@/types'

export const themeConfig: ThemeConfig = {
  global: {
    // 文章文本的字体样式
    fontStyle: 'sans',
    // 文章的日期格式
    dateFormat: 'YYYY-MM-DD',
    // 默认为所有文章启用目录
    toc: true,
  },

  color: {
    // 默认主题模式
    mode: 'light', // light, dark, auto
    light: {
      // 主要颜色 - 用于标题、悬停等
      primary: 'oklch(25% 0.005 298)',
      // 次要颜色 - 用于文章文本
      secondary: 'oklch(40% 0.005 298)',
      // 背景颜色
      background: 'oklch(96% 0.005 298)',
      // 高亮颜色 - 用于导航栏、选中文本等
      highlight: 'oklch(0.93 0.195089 103.2532 / 0.5)', // rgba(255,235,0,0.5)
    },
    dark: {
      // 主要颜色
      primary: 'oklch(92% 0.005 298)',
      // 次要颜色
      secondary: 'oklch(77% 0.005 298)',
      // 背景颜色
      background: 'oklch(22% 0.005 298)',
      // 高亮颜色
      highlight: 'oklch(0.93 0.195089 103.2532 / 0.2)', // rgba(255,235,0,0.2)
    },
  },
}
