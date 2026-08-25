export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "same-origin",
    headers: options.body ? { "Content-Type": "application/json", ...options.headers } : options.headers,
    ...options,
  });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "Permintaan gagal. Coba kembali.");
    error.status = response.status;
    if (response.status === 401 && typeof window !== "undefined") window.dispatchEvent(new Event("auth:expired"));
    throw error;
  }
  return data;
}

export function invitationUrl(slug) {
  return `${window.location.origin}/invite/${slug}`;
}
