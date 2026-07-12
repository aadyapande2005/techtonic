import axios from 'axios'

// const baseURL = import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '')

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const apiRequest = axios.create({
    baseURL,
    withCredentials: true
})