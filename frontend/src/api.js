const API_URL = import.meta.env.Backend_API_URL || 'http://localhost:8000'

async function parseResponse(response) {
  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const detail = data?.detail
    let message = typeof detail === 'string' ? detail : detail?.message
    if (!message && Array.isArray(detail)) message = detail[0]?.msg
    throw new Error(message || 'Request failed')
  }
  return data
}

export async function storeWeatherData(payload) {
  const response = await fetch(`${API_URL}/store-weather-data`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return parseResponse(response)
}

export async function listWeatherFiles() {
  const response = await fetch(`${API_URL}/list-weather-files`)
  return parseResponse(response)
}

export async function getWeatherFile(file) {
  const response = await fetch(
    `${API_URL}/weather-file-content/${encodeURIComponent(file)}`,
  )
  return parseResponse(response)
}
