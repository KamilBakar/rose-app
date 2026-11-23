export async function api(endpoint, { method = 'GET', data, signal } = {}) {
  let response
  try {
    response = await fetch('/api/' + endpoint, {
      method, signal, credentials: 'same-origin', cache: 'no-store',
      headers: data ? { 'Content-Type': 'application/json' } : undefined,
      body: data ? JSON.stringify(data) : undefined,
    })
  } catch (error) {
    if (error.name === 'AbortError') throw error
    throw new Error('Cannot reach the local API. Check that PHP is running on port 8000.', { cause: error })
  }

  const result = await response.json().catch(() => null)
  if (!response.ok || !result) {
    const error = new Error(result?.error ?? 'The local API did not return JSON. Check the PHP server and Vite proxy.')
    error.status = response.status
    throw error
  }
  return result
}

export const post = (endpoint, data) => api(endpoint, { method: 'POST', data })
