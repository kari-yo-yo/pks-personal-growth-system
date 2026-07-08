/**
 * 安全访问工具函数 — 防御 null/undefined 导致的运行时崩溃
 */

/** 安全的 Map.get() — 如果 map 不存在或不是 Map，返回 null */
export function safeMapGet<K, V>(
  map: Map<K, V> | null | undefined,
  key: K
): V | null {
  if (!map || !(map instanceof Map)) {
    return null;
  }
  try {
    return map.get(key) ?? null;
  } catch {
    return null;
  }
}

/** 安全的对象路径访问 — 支持嵌套路径如 'colors.primary' */
export function safeGet<T>(
  obj: Record<string, unknown> | null | undefined,
  path: string,
  defaultValue: T
): T {
  if (!obj || typeof obj !== 'object') {
    return defaultValue;
  }
  const keys = path.split('.');
  let result: unknown = obj;
  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = (result as Record<string, unknown>)[key];
  }
  return (result === null || result === undefined) ? defaultValue : (result as T);
}

/** 安全的字符串 .replace() */
export function safeReplace(
  str: unknown,
  search: string | RegExp,
  replacement: string
): string {
  if (!str || typeof str !== 'string') {
    return '';
  }
  try {
    return str.replace(search, replacement);
  } catch {
    return str;
  }
}

/** 安全的 JSON.parse() */
export function safeJSONParse<T>(str: string | null | undefined, defaultValue: T): T {
  if (!str) return defaultValue;
  try {
    return JSON.parse(str) as T;
  } catch {
    return defaultValue;
  }
}

/** 安全地从数组取元素 — 越界时返回 null */
export function safeArrayGet<T>(arr: T[] | null | undefined, index: number): T | null {
  if (!arr || !Array.isArray(arr) || index < 0 || index >= arr.length) {
    return null;
  }
  return arr[index] ?? null;
}
