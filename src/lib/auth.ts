export function getToken(): string | null {
  return sessionStorage.getItem('token')
}

export function setToken(token: string): void {
  sessionStorage.setItem('token', token)
}

export function clearToken(): void {
  sessionStorage.removeItem('token')
  sessionStorage.removeItem('teamSlug')
}

export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('token')
}

export function getTeamSlug(): string | null {
  return sessionStorage.getItem('teamSlug')
}

export function setTeamSlug(slug: string): void {
  sessionStorage.setItem('teamSlug', slug)
}
