export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export async function fetchApi(path: string, options: RequestInit = {}) {
  const url = path.startsWith("http") ? path : `${API_URL}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "include",
  });
  return response;
}
