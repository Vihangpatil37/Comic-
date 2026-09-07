import { supabase } from "./supabase-client";
import type { ComicSummary, ComicDetail } from "../../shared/types/comic";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api";

async function getAuthHeader(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export async function fetchComics(category?: string, page = 1): Promise<{ comics: ComicSummary[], total: number }> {
  const url = new URL(`${API_BASE}/comics`);
  if (category) url.searchParams.set("category", category);
  url.searchParams.set("page", page.toString());

  const res = await fetch(url.toString(), { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch comics");
  return res.json();
}

export async function fetchComic(slug: string): Promise<ComicDetail> {
  const res = await fetch(`${API_BASE}/comics/${slug}`, { cache: 'no-store' });
  if (!res.ok) {
    if (res.status === 404) throw new Error("not_found");
    throw new Error("Failed to fetch comic");
  }
  return res.json();
}

export async function fetchComicReadUrl(slug: string): Promise<{ pdfUrl: string, expiresAt: string }> {
  const res = await fetch(`${API_BASE}/comics/${slug}/read`, { cache: 'no-store' });
  if (!res.ok) throw new Error("Failed to fetch PDF URL");
  return res.json();
}

// Admin calls
export async function fetchAdminComics(): Promise<ComicSummary[]> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/admin/comics`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function fetchAdminComic(id: string): Promise<ComicDetail> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/admin/comics/${id}`, { headers, cache: 'no-store' });
  if (!res.ok) throw new Error("Unauthorized");
  return res.json();
}

export async function createComic(formData: FormData): Promise<ComicDetail> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/admin/comics`, {
    method: "POST",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to create comic");
  return res.json();
}

export async function updateComic(id: string, formData: FormData): Promise<ComicDetail> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/admin/comics/${id}`, {
    method: "PATCH",
    headers,
    body: formData,
  });
  if (!res.ok) throw new Error("Failed to update comic");
  return res.json();
}

export async function deleteComic(id: string): Promise<void> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/admin/comics/${id}`, {
    method: "DELETE",
    headers,
  });
  if (!res.ok) throw new Error("Failed to delete comic");
}

export async function publishComic(id: string): Promise<ComicDetail> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/admin/comics/${id}/publish`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to publish");
  return res.json();
}

export async function unpublishComic(id: string): Promise<ComicDetail> {
  const headers = await getAuthHeader();
  const res = await fetch(`${API_BASE}/admin/comics/${id}/unpublish`, {
    method: "POST",
    headers,
  });
  if (!res.ok) throw new Error("Failed to unpublish");
  return res.json();
}
