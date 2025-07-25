import type { CollectionEntry } from 'astro:content'
import { getCollection, render } from 'astro:content'
import { memoize } from './cache'

export type Post = CollectionEntry<'posts'> & {
  remarkPluginFrontmatter: {
    minutes: number
  }
}

/**
 * 为文章添加包括阅读时间在内的元数据
 * @param post 要增强元数据的文章
 * @returns 包含阅读时间信息的增强文章
 */
const metaCache = new Map<string, { minutes: number }>()
async function addMetaToPost(post: CollectionEntry<'posts'>): Promise<Post> {
  const cacheKey = post.id

  if (!metaCache.has(cacheKey)) {
    const { remarkPluginFrontmatter } = await render(post)
    metaCache.set(cacheKey, remarkPluginFrontmatter as { minutes: number })
  }

  return {
    ...post,
    remarkPluginFrontmatter: metaCache.get(cacheKey)!,
  }
}

/**
 * 获取所有文章（包括置顶文章，生产环境下排除草稿）
 * @returns 增强元数据、按日期排序的文章
 */
async function _getPosts() {
  const filteredPosts = await getCollection('posts', ({ data }: CollectionEntry<'posts'>) => {
    // 仅在开发模式下显示草稿
    return import.meta.env.DEV || !data.draft
  })

  const enhancedPosts = await Promise.all(filteredPosts.map(addMetaToPost))

  return enhancedPosts.sort((a: Post, b: Post) => b.data.published.valueOf() - a.data.published.valueOf())
}

// 导出记忆化版本
export const getPosts = memoize(_getPosts)

/**
 * 获取所有非置顶文章
 * @returns 常规文章（非置顶）
 */
async function _getRegularPosts() {
  const posts = await getPosts()
  return posts.filter(post => !post.data.pin)
}
// 导出记忆化版本
export const getRegularPosts = memoize(_getRegularPosts)

/**
 * 获取按置顶优先级排序的置顶文章
 * @returns 按置顶值降序排列的置顶文章
 */
async function _getPinnedPosts() {
  const posts = await getPosts()
  return posts.filter(post => post.data.pin && post.data.pin > 0).sort((a, b) => (b.data.pin ?? 0) - (a.data.pin ?? 0))
}

// 导出记忆化版本
export const getPinnedPosts = memoize(_getPinnedPosts)

/**
 * 按年份分组文章并在每年内排序
 * @returns 按年份分组（降序）的文章映射，每年内按日期排序
 */
async function _getPostsByYear(): Promise<Map<number, Post[]>> {
  const posts = await getRegularPosts()
  const yearMap = new Map<number, Post[]>()

  posts.forEach((post: Post) => {
    const year = post.data.published.getFullYear()
    if (!yearMap.has(year)) {
      yearMap.set(year, [])
    }
    yearMap.get(year)!.push(post)
  })

  yearMap.forEach(yearPosts => {
    yearPosts.sort((a, b) => {
      const aDate = a.data.published
      const bDate = b.data.published
      return bDate.getMonth() - aDate.getMonth() || bDate.getDate() - aDate.getDate()
    })
  })

  return new Map([...yearMap.entries()].sort((a, b) => b[0] - a[0]))
}

// 导出记忆化版本
export const getPostsByYear = memoize(_getPostsByYear)

/**
 * 按标签分组文章
 * @returns 以标签名为键、包含该标签的文章数组为值的映射
 */
async function _getPostsGroupByTags() {
  const posts = await getPosts()
  const tagMap = new Map<string, Post[]>()

  posts.forEach((post: Post) => {
    post.data.tags?.forEach((tag: string) => {
      if (!tagMap.has(tag)) {
        tagMap.set(tag, [])
      }
      tagMap.get(tag)!.push(post)
    })
  })

  return tagMap
}
// 导出记忆化版本
export const getPostsGroupByTags = memoize(_getPostsGroupByTags)

/**
 * 获取按文章数量排序的所有标签
 * @returns 按热度排序的标签数组（文章最多的在前）
 */
async function _getAllTags() {
  const tagMap = await getPostsGroupByTags()
  const tagsWithCount = Array.from(tagMap.entries())

  tagsWithCount.sort((a, b) => b[1].length - a[1].length)
  return tagsWithCount.map(([tag]) => tag)
}
// 导出记忆化版本
export const getAllTags = memoize(_getAllTags)

/**
 * 获取包含特定标签的所有文章
 * @param tag 用于过滤文章的标签名
 * @returns 包含指定标签的文章数组
 */
async function _getPostsByTag(tag: string) {
  const tagMap = await getPostsGroupByTags()
  return tagMap.get(tag) ?? []
}
// 导出记忆化版本
export const getPostsByTag = memoize(_getPostsByTag)
