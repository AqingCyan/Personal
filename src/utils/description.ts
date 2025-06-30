import { type CollectionEntry } from 'astro:content'
import MarkdownIt from 'markdown-it'

type ExcerptScene = 'list' | 'meta' | 'og' | 'feed'

const parser = new MarkdownIt()

// 不同场景下的摘要长度
const EXCERPT_LENGTHS: Record<ExcerptScene, number> = {
  list: 120,
  meta: 120,
  og: 70,
  feed: 70,
}

const HTML_ENTITIES: Record<string, string> = {
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
}

// 从 Markdown 内容生成摘要
export function generateExcerpt(content: string, scene: ExcerptScene): string {
  if (!content) {
    return ''
  }

  // 移除 HTML 注释和 Markdown 标题
  const contentWithoutHeadings = content
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^#{1,6}\s+\S.*$/gm, '')
    .replace(/\n{2,}/g, '\n\n')

  const length = EXCERPT_LENGTHS[scene]

  // 移除所有 HTML 标签
  let plainText = parser.render(contentWithoutHeadings).replace(/<[^>]*>/g, '')

  // 使用映射表解码 HTML 实体
  Object.entries(HTML_ENTITIES).forEach(([entity, char]) => {
    plainText = plainText.replace(new RegExp(entity, 'g'), char)
  })

  // 将换行符替换为空格
  const normalizedText = plainText
    .replace(/\s+/g, ' ')
    // 移除中日韩标点符号后的空格
    .replace(/([。？！："」』])\s+/g, '$1')
  const excerpt = normalizedText.slice(0, length).trim()
  // 移除摘要末尾的标点符号
  if (normalizedText.length > length) {
    return `${excerpt.replace(/\p{P}+$/u, '')}...`
  }
  return excerpt
}

/**
 * 自动生成文章描述
 * @param post 文章
 * @param scene 场景
 * @returns 描述
 */
export function generateDescription(post: CollectionEntry<'posts'>, scene: ExcerptScene): string {
  // 优先使用现有描述
  if (post.data.description) {
    // 仅在 OG 场景中应用字符限制
    return scene === 'og' ? generateExcerpt(post.data.description, scene) : post.data.description
  }

  return generateExcerpt(post.body || '', scene)
}
