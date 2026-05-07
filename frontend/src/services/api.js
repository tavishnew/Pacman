import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000
})

export function getAuthHeaders(token) {
  if (!token || token === 'guest-session') {
    return {}
  }

  return {
    Authorization: `Bearer ${token}`
  }
}

export function getAuthConfig(token) {
  return {
    headers: getAuthHeaders(token)
  }
}

export function getApiErrorMessage(error, fallbackMessage) {
  if (!error?.response) {
    if (error?.message) {
      return `${fallbackMessage}: ${error.message}`
    }
    return `${fallbackMessage}: cannot reach the server.`
  }

  const statusMessage = error.response.data?.error || error.response.statusText || 'Unknown error'
  return `${fallbackMessage}: ${statusMessage}`
}

export { API_BASE_URL }
