/**
 * 记忆化装饰器 - 为异步函数提供内存缓存
 *
 * @param fn 要进行记忆化的原始异步函数
 * @returns 具有缓存功能的函数包装器
 */

export function memoize<T>(fn: (...args: any[]) => Promise<T>) {
  const cache = new Map<string, Promise<T>>()

  return async (...args: any[]): Promise<T> => {
    const key = JSON.stringify(args) ?? 'default'
    if (cache.has(key)) {
      return cache.get(key)!
    }

    const promise = fn(...args)
    cache.set(key, promise)
    return promise
  }
}
