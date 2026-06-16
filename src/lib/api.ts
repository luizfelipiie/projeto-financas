const BASE = '/api'

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API ${res.status}: ${url}`)
  if (res.status === 204) return undefined as T
  return res.json()
}

export const api = {
  profiles: {
    list: () => req<unknown[]>('/profiles'),
    create: (data: object) => req<unknown>('/profiles', { method: 'POST', body: JSON.stringify(data) }),
    delete: (id: string) => req<void>(`/profiles/${id}`, { method: 'DELETE' }),
  },
  accounts: {
    list: (profileId: string) => req<unknown[]>(`/accounts/${profileId}`),
    create: (data: object) => req<unknown>('/accounts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) => req<unknown>(`/accounts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => req<void>(`/accounts/${id}`, { method: 'DELETE' }),
  },
  transactions: {
    list: (profileId: string) => req<unknown[]>(`/transactions/${profileId}`),
    create: (data: object) => req<unknown>('/transactions', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) => req<unknown>(`/transactions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => req<void>(`/transactions/${id}`, { method: 'DELETE' }),
  },
  goals: {
    list: (profileId: string) => req<unknown[]>(`/goals/${profileId}`),
    create: (data: object) => req<unknown>('/goals', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: string, data: object) => req<unknown>(`/goals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id: string) => req<void>(`/goals/${id}`, { method: 'DELETE' }),
  },
  messages: {
    list: (profileId: string) => req<unknown[]>(`/messages/${profileId}`),
    create: (data: object) => req<unknown>('/messages', { method: 'POST', body: JSON.stringify(data) }),
  },
}
