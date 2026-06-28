export const API_BASE_URL = "http://localhost:3000";

export function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("nordtf_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}
