/**
 * 检查清理后的路径是否匹配特定页面类型
 * @param path 要检查的路径
 * @param prefix 页面类型前缀
 * @returns 路径是否匹配页面类型
 */
function isPageType(path: string, prefix: string = '') {
  // 移除路径开头和结尾的斜杠
  const clean = path.replace(/^\/|\/$/g, '')

  // 如果没有前缀，检查是否为根路径
  if (prefix === '') {
    return clean === ''
  }

  // 检查路径是否以指定前缀开头
  return clean.startsWith(prefix)
}

/**
 * 检查当前路径是否为首页
 * @param path 当前路径
 * @returns 是否为首页
 */
export function isHomePage(path: string) {
  return isPageType(path)
}

/**
 * 检查当前路径是否为文章页面
 * @param path 当前路径
 * @returns 是否为文章页面
 */
export function isPostPage(path: string) {
  return isPageType(path, 'posts')
}

/**
 * 检查当前路径是否为标签页面
 * @param path 当前路径
 * @returns 是否为标签页面
 */
export function isTagPage(path: string) {
  return isPageType(path, 'tags')
}
/**
 * 检查当前路径是否为关于页面
 * @param path 当前路径
 * @returns 是否为关于页面
 */
export function isAboutPage(path: string) {
  return isPageType(path, 'about')
}

/**
 * 返回页面上下文信息
 * @param path 当前路径
 * @returns 页面信息对象
 */
export function getPageInfo(path: string) {
  const isHome = isHomePage(path)
  const isPost = isPostPage(path)
  const isTag = isTagPage(path)
  const isAbout = isAboutPage(path)

  return {
    isHome,
    isPost,
    isTag,
    isAbout,
  }
}
