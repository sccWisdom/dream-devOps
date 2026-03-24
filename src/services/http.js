const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim()
const REQUEST_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT || 12000)

function toQueryString(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === '' || value === undefined || value === null) return
    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item === '' || item === undefined || item === null) return
        search.append(key, String(item))
      })
      return
    }
    search.append(key, String(value))
  })
  const query = search.toString()
  return query ? `?${query}` : ''
}

function mergeUrl(path, query) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE}${normalizedPath}${toQueryString(query)}`
}

export async function requestJson(path, options = {}) {
  const {
    method = 'GET',
    query = {},
    body,
    headers = {}
  } = options

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
  const url = mergeUrl(path, query)

  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal
    })
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  } finally {
    clearTimeout(timer)
  }
}

export function hasApiBase() {
  return Boolean(API_BASE)
}
