import { defineConfig } from 'astro/config'
import UnoCSS from 'unocss/astro'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeExternalLinks from 'rehype-external-links'
import rehypeKatex from 'rehype-katex'
import rehypeSlug from 'rehype-slug'
import remarkDirective from 'remark-directive'
import remarkMath from 'remark-math'
import { visit } from 'unist-util-visit'
import { rehypeCodeCopyButton } from './src/plugins/rehype-code-copy-button.mjs'
import { rehypeImgToFigure } from './src/plugins/rehype-img-to-figure.mjs'
import { rehypeUnwrapImg } from './src/plugins/rehype-unwrap-img.mjs'
import { remarkAdmonitions } from './src/plugins/remark-admonitions.mjs'
import { remarkGithubCard } from './src/plugins/remark-github-card.mjs'
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs'
import type { Element } from 'hast'

export default defineConfig({
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkDirective, remarkMath, remarkAdmonitions, remarkGithubCard, remarkReadingTime],
    rehypePlugins: [
      rehypeKatex,
      rehypeSlug,
      rehypeCodeCopyButton,
      rehypeImgToFigure,
      rehypeUnwrapImg, // Must be after rehypeImgToFigure
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          test: ['h1', 'h2', 'h3', 'h4'],
          content: {
            type: 'element',
            tagName: 'svg',
            properties: {
              viewBox: '0 0 24 24',
              'aria-hidden': 'true',
              fill: 'currentColor',
            },
            children: [
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  d: 'M2.6 21.4c2 2 5.9 2.9 8.9 0l3.5-3.5-1-1-3.5 3.5c-1.4 1.4-4.2 1.9-6.4-.3s-1.8-5-.3-6.4l3.5-3.5-1-1-3.5 3.5c-3 3-2 6.9 0 8.9ZM21.4 2.6c2 2 2.9 5.9 0 8.9L17.9 15l-1-1 3.5-3.5c1.4-1.4 1.9-4.2-.3-6.4s-5-1.8-6.4-.3l-3.5 3.5-1-1 3.5-3.5c3-3 6.9-2 8.9 0Z',
                },
              },
              {
                type: 'element',
                tagName: 'path',
                properties: {
                  d: 'm8.01 14.97 6.93-6.93 1.061 1.06-6.93 6.93z',
                },
              },
            ],
          },
          properties: (el: Element) => {
            let text = ''
            visit(el, 'text', textNode => {
              text += textNode.value
            })
            return {
              className: ['heading-anchor-link'],
              ariaLabel: text
                ? `Link to ${text.replace(/["']/g, char => (char === '"' ? '&quot;' : '&#39;'))}`
                : undefined,
            }
          },
        },
      ],
      [
        rehypeExternalLinks,
        {
          target: '_blank',
          rel: ['nofollow', 'noopener', 'noreferrer', 'external'],
          protocols: ['http', 'https', 'mailto'],
        },
      ],
    ],
    shikiConfig: {
      // Available themes: https://shiki.style/themes
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    },
  },
})
