// ... existing code ...

export async function fetchWithGoogleAuth(input: RequestInfo, init: RequestInit = {}, token?: string) {
  let headers = init.headers ? { ...init.headers } : {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return fetch(input, { ...init, headers });
}