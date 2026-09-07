"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ComicSummary } from "../../../../shared/types/comic";
import { fetchAdminComics, publishComic, unpublishComic, deleteComic } from "../../../lib/api-client";

export default function AdminComicsPage() {
  const [comics, setComics] = useState<ComicSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadComics = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminComics();
      setComics(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComics();
  }, []);

  const handlePublishToggle = async (comic: ComicSummary) => {
    try {
      if (comic.status === "PUBLISHED") {
        await unpublishComic(comic.id);
      } else {
        await publishComic(comic.id);
      }
      loadComics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (comic: ComicSummary) => {
    const confirmName = prompt(`Type "${comic.title}" to confirm deletion of this comic and its storage files:`);
    if (confirmName !== comic.title) {
      if (confirmName !== null) alert("Title did not match. Deletion cancelled.");
      return;
    }
    
    try {
      await deleteComic(comic.id);
      loadComics();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return <div>Loading comics...</div>;
  if (error) return <div className="text-oxide">{error}</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl">All Comics</h2>
        <Link 
          href="/admin/comics/new"
          className="bg-ink text-paper px-4 py-2 rounded text-sm hover:opacity-90"
        >
          Add Comic
        </Link>
      </div>

      <div className="overflow-x-auto border border-hairline rounded bg-paper">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-hairline text-sm text-slate">
              <th className="p-4 font-normal w-24">Entry #</th>
              <th className="p-4 font-normal">Title</th>
              <th className="p-4 font-normal w-32">Status</th>
              <th className="p-4 font-normal w-24">Year</th>
              <th className="p-4 font-normal w-48 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {comics.map(comic => (
              <tr key={comic.id} className="border-b border-hairline last:border-0 hover:bg-vellum/50 transition-colors">
                <td className="p-4 font-data text-sm">{comic.entryNumber?.toString().padStart(3, '0') || '—'}</td>
                <td className="p-4 font-medium">{comic.title}</td>
                <td className="p-4">
                  <span className={`text-xs px-2 py-1 rounded border font-data ${comic.status === 'PUBLISHED' ? 'bg-slate/10 border-slate/20 text-slate' : 'bg-oxide/10 border-oxide/20 text-oxide'}`}>
                    {comic.status}
                  </span>
                </td>
                <td className="p-4 font-data text-sm">{comic.year}</td>
                <td className="p-4 text-right flex gap-3 justify-end items-center text-sm">
                  <Link href={`/admin/comics/${comic.id}/edit`} className="text-slate hover:text-ink">
                    Edit
                  </Link>
                  <button 
                    onClick={() => handlePublishToggle(comic)} 
                    className="text-slate hover:text-ink"
                  >
                    {comic.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button 
                    onClick={() => handleDelete(comic)} 
                    className="text-oxide hover:underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {comics.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate">No comics found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
