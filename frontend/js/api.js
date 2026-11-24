const API_BASE = "/api";

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem("blog_token");
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });
  let data = {};
  try { data = await response.json(); } catch (_) {}

  if (!response.ok) throw new Error(data.message || `Request failed (${response.status})`);
  return data;
}
