export function getToken(): string | null {
  return sessionStorage.getItem('token')
}

export function setToken(token: string): void {
  sessionStorage.setItem('token', token)
}

export function clearToken(): void {
  sessionStorage.removeItem('token')
}

export function isAuthenticated(): boolean {
  return !!sessionStorage.getItem('token')
}
