import type { APIContext, ImageMetadata } from 'astro'
import type { CollectionEntry } from 'astro:content'
import type { Author } from 'feed'
import { getImage } from 'astro:assets'
import { getCollection } from 'astro:content'
import { Feed } from 'feed'
import MarkdownIt from 'markdown-it'
import { parse as htmlParser } from 'node-html-parser'
import sanitizeHtml from 'sanitize-html'
import { themeConfig } from '@/config'
import { memoize } from '@/utils/cache'
import { generateDescription } from '@/utils/description'

const markdownParser = new MarkdownIt()
const { title, description, url, author: siteAuthor } = themeConfig.site

// 动态导入 /src/content/posts/_images 目录下的所有图片
const imagesGlob = import.meta.glob<{ default: ImageMetadata }>(
  '/src/content/posts/_images/**/*.{jpeg,jpg,png,gif,webp}',
)

/**
 * 优化图片 URL
 *
 * @param srcPath 图片的源相对路径
 * @param baseUrl 站点的基础 URL
 * @returns 优化后的完整图片 URL 或 null
 */
const getOptimizedImageUrl = memoize(async (srcPath: string, baseUrl: string) => {
  const prefixRemoved = srcPath.replace(/^\.\.\/|^\.\//, '')
  const rawImagePath = `/src/content/posts/${prefixRemoved}`
  const rawImageModule = imagesGlob[rawImagePath]

  if (!rawImageModule) {
    return null
  }

  const rawImageMetadata = await rawImageModule()
    .then(res => res.default)
    .catch(() => null)
  if (!rawImageMetadata) {
    return null
  }

  const processedImageData = await getImage({ src: rawImageMetadata })
  return new URL(processedImageData.src, baseUrl).toString()
})

/**
 * 修复 HTML 内容中的相对图片路径
 *
 * @param htmlContent HTML 内容字符串
 * @param baseUrl 站点的基础 URL
 * @returns 处理后的 HTML 字符串，所有图片路径都转换为绝对 URL
 */
async function fixRelativeImagePaths(htmlContent: string, baseUrl: string): Promise<string> {
  const htmlDoc = htmlParser(htmlContent)
  const images = htmlDoc.getElementsByTagName('img')
  const imagePromises = []

  for (const img of images) {
    const src = img.getAttribute('src')

    if (!src) {
      continue
    }

    imagePromises.push(
      (async () => {
        try {
          // 如果不是相对路径或公共图片路径则跳过
          if (!src.startsWith('./') && !src.startsWith('../') && !src.startsWith('/images')) {
            return
          }

          // 处理来自 src/content/posts/_images 目录的图片
          if (src.startsWith('./') || src.startsWith('../')) {
            const optimizedImageUrl = await getOptimizedImageUrl(src, baseUrl)

            if (optimizedImageUrl) {
              img.setAttribute('src', optimizedImageUrl)
            }
            return
          }

          // 处理来自 public/images 目录的图片
          const publicImageUrl = new URL(src, baseUrl).toString()
          img.setAttribute('src', publicImageUrl)
        } catch (error) {
          console.warn(`Failed to process image in RSS feed: ${src}`, (error as Error)?.message ?? String(error))
        }
      })(),
    )
  }

  await Promise.all(imagePromises)
  return htmlDoc.toString()
}

/**
 * 生成文章 URL
 *
 * @param post 文章集合条目
 * @param baseUrl 站点的基础 URL
 * @returns 文章的完整 URL
 */
function generatePostUrl(post: CollectionEntry<'posts'>, baseUrl: string): string {
  const postSlug = post.data.abbrlink || post.id
  return new URL(`posts/${postSlug}/`, baseUrl).toString()
}

/**
 * 生成支持 RSS 和 Atom 格式的 feed 对象
 *
 * @returns 准备用于 RSS 或 Atom 输出的 Feed 实例
 */
export async function generateFeed() {
  const siteURL = url.endsWith('/') ? url : `${url}/`
  const author: Author = {
    name: siteAuthor,
    link: url,
  }

  // 创建 Feed 实例
  const feed = new Feed({
    title,
    description,
    id: siteURL,
    link: siteURL,
    language: 'zh-CN',
    copyright: `Copyright © ${new Date().getFullYear()} ${siteAuthor}`,
    updated: new Date(),
    generator: 'Astro-Theme-Retypeset with Feed for Node.js',
    feedLinks: {
      rss: new URL('/rss.xml', url).toString(),
      atom: new URL('/atom.xml', url).toString(),
    },
    author,
  })

  // 获取所有文章并排除草稿
  const posts = await getCollection('posts', ({ data }: { data: CollectionEntry<'posts'>['data'] }) => !data.draft)

  // 按发布日期降序排序文章并限制为最新的 25 篇
  const limitedPosts = [...posts]
    .sort((a, b) => new Date(b.data.published).getTime() - new Date(a.data.published).getTime())
    .slice(0, 25)

  // 将文章添加到 feed
  for (const post of limitedPosts) {
    const postLink = generatePostUrl(post, siteURL)

    // 优化内容处理
    const postContent = post.body
      ? sanitizeHtml(
          await fixRelativeImagePaths(
            // 在渲染 markdown 之前移除 HTML 注释
            markdownParser.render(post.body.replace(/<!--[\s\S]*?-->/g, '')),
            url,
          ),
          {
            // 在 feed 内容中允许 <img> 标签
            allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
          },
        )
      : ''

    // publishDate -> Atom:<published>, RSS:<pubDate>
    const publishDate = new Date(post.data.published)
    // updateDate -> Atom:<updated>, RSS 没有更新标签
    const updateDate = post.data.updated ? new Date(post.data.updated) : publishDate

    feed.addItem({
      title: post.data.title,
      id: postLink,
      link: postLink,
      description: generateDescription(post, 'feed'),
      content: postContent,
      author: [author],
      published: publishDate,
      date: updateDate,
    })
  }

  return feed
}

/**
 * 生成 RSS 2.0 格式的 feed
 *
 * @returns 包含 RSS XML 内容的 Response 对象
 */
export async function generateRSS() {
  const feed = await generateFeed()

  let rssXml = feed.rss2()
  rssXml = rssXml.replace(
    '<?xml version="1.0" encoding="utf-8"?>',
    '<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet href="/feeds/rss-style.xsl" type="text/xsl"?>',
  )

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  })
}

/**
 * 生成 Atom 1.0 格式的 feed
 *
 * @returns 包含 Atom XML 内容的 Response 对象
 */
export async function generateAtom() {
  const feed = await generateFeed()

  let atomXml = feed.atom1()
  atomXml = atomXml.replace(
    '<?xml version="1.0" encoding="utf-8"?>',
    '<?xml version="1.0" encoding="utf-8"?>\n<?xml-stylesheet href="/feeds/atom-style.xsl" type="text/xsl"?>',
  )

  return new Response(atomXml, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
    },
  })
}
