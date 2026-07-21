export const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchApi(path: string, options: RequestInit = {}) {
  const isServer = typeof window === "undefined";
  const baseUrl = API_URL || (isServer ? "http://localhost:5000" : "");
  const url = path.startsWith("http") ? path : `${baseUrl}${path}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include",
    });
    return response;
  } catch (err) {
    console.error("API Fetch Error:", err);
    throw err;
  }
}
