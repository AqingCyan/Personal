import type { ThemeConfig } from '@/types'

export const themeConfig: ThemeConfig = {
  site: {
    title: '生活笔记',
    subtitle: '个人的一点小总结',
    author: 'AqingCyan',
    description: 'AqingCyan 的个人博客，记录一下生活',
    url: 'https://aqingcyan.com',
  },
  global: {
    // 文章文本的字体样式
    fontStyle: 'sans',
    // 文章的日期格式
    dateFormat: 'YYYY-MM-DD',
    // 默认为所有文章启用目录
    toc: true,
    // 启用 KaTeX 数学公式渲染
    katex: true,
    // 减少动画和过渡效果以提高性能
    reduceMotion: false,
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

  // 页脚设置 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> 开始
  footer: {
    // 社交链接
    links: [
      {
        name: 'RSS',
        url: '/atom.xml', // 或 /rss.xml
      },
      {
        name: 'GitHub',
        url: 'https://github.com/AqingCyan',
      },
      {
        name: 'Email',
        url: 'aqingcyan@gmail.com',
      },
      // {
      //   name: 'X',
      //   url: 'https://x.com/radishzz_',
      // },
    ],
    // 网站开始年份
    startYear: 2025,
  },
}
