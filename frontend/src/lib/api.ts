export const API_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

export function getPdfUrl(billId: string) {
  const token = typeof window !== "undefined" ? localStorage.getItem("adyapan_token") : null;
  const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
  return `${API_URL}/api/bills/${billId}/pdf${tokenQuery}`;
}

export async function fetchApi(path: string, options: RequestInit = {}) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = path.startsWith("http") ? path : `${API_URL}${normalizedPath}`;

  const token = typeof window !== "undefined" ? localStorage.getItem("adyapan_token") : null;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((val, key) => {
        headers[key] = val;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, val]) => {
        headers[key] = val;
      });
    } else {
      Object.assign(headers, options.headers);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: "include",
    });

    if (response.status === 401 && typeof window !== "undefined" && !path.includes("/api/auth/login")) {
      localStorage.removeItem("adyapan_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return response;
  } catch (err) {
    console.error(`[API Fetch Error] Failed requesting ${url}:`, err);
    throw err;
  }
}

export async function viewBillPdf(billId: string) {
  const response = await fetchApi(`/api/bills/${billId}/pdf`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch PDF");
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  window.open(blobUrl, "_blank");
}

export async function downloadBillPdf(billId: string, filename?: string) {
  const response = await fetchApi(`/api/bills/${billId}/pdf`);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to download PDF");
  }
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = blobUrl;
  link.download = filename || `Invoice-${billId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
}
