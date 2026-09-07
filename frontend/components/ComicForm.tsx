// ComicForm - shared for create and edit
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ComicDetail } from "../../shared/types/comic";
import { createComic, updateComic } from "../lib/api-client";

interface ComicFormProps {
  initialData?: ComicDetail;
  isEdit?: boolean;
}

export default function ComicForm({ initialData, isEdit }: ComicFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [category, setCategory] = useState(initialData?.category || "");
  const [year, setYear] = useState(initialData?.year?.toString() || new Date().getFullYear().toString());
  const [pageCount, setPageCount] = useState(initialData?.pageCount?.toString() || "");

  // Files
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!isEdit && (!pdfFile || !coverFile)) {
      setError("PDF and Cover files are required for new comics.");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    if (description) formData.append("description", description);
    if (category) formData.append("category", category);
    formData.append("year", year);
    formData.append("pageCount", pageCount);
    if (pdfFile) formData.append("pdf", pdfFile);
    if (coverFile) formData.append("cover", coverFile);

    try {
      if (isEdit && initialData) {
        await updateComic(initialData.id, formData);
      } else {
        await createComic(formData);
      }
      router.push("/admin/comics");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-paper p-8 border border-hairline rounded">
      {error && (
        <div className="p-4 bg-oxide/10 text-oxide border border-oxide/20 rounded text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm text-slate mb-2">Title *</label>
          <input 
            type="text" required 
            value={title} onChange={e => setTitle(e.target.value)}
            className="w-full bg-vellum border border-hairline rounded px-4 py-2 focus:outline-none focus:border-oxide"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-slate mb-2">Description</label>
          <textarea 
            rows={4}
            value={description} onChange={e => setDescription(e.target.value)}
            className="w-full bg-vellum border border-hairline rounded px-4 py-2 focus:outline-none focus:border-oxide"
          />
        </div>

        <div>
          <label className="block text-sm text-slate mb-2">Category</label>
          <input 
            type="text" 
            value={category} onChange={e => setCategory(e.target.value)}
            className="w-full bg-vellum border border-hairline rounded px-4 py-2 focus:outline-none focus:border-oxide"
          />
        </div>

        <div>
          <label className="block text-sm text-slate mb-2">Year *</label>
          <input 
            type="number" required 
            value={year} onChange={e => setYear(e.target.value)}
            className="w-full bg-vellum border border-hairline rounded px-4 py-2 focus:outline-none focus:border-oxide font-data"
          />
        </div>

        <div>
          <label className="block text-sm text-slate mb-2">Page Count *</label>
          <input 
            type="number" required 
            value={pageCount} onChange={e => setPageCount(e.target.value)}
            className="w-full bg-vellum border border-hairline rounded px-4 py-2 focus:outline-none focus:border-oxide font-data"
          />
        </div>

        <div className="md:col-span-2 border-t border-hairline pt-6 mt-2">
          <label className="block text-sm text-slate mb-2">Comic PDF File {isEdit && "(Leave blank to keep current)"}</label>
          <input 
            type="file" accept="application/pdf"
            required={!isEdit}
            onChange={e => setPdfFile(e.target.files?.[0] || null)}
            className="w-full bg-vellum border border-hairline rounded px-4 py-2"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm text-slate mb-2">Cover Image File {isEdit && "(Leave blank to keep current)"}</label>
          <input 
            type="file" accept="image/*"
            required={!isEdit}
            onChange={e => setCoverFile(e.target.files?.[0] || null)}
            className="w-full bg-vellum border border-hairline rounded px-4 py-2"
          />
        </div>
      </div>

      <div className="pt-6 border-t border-hairline flex justify-end gap-4">
        <button 
          type="button" 
          onClick={() => router.push("/admin/comics")}
          className="px-6 py-2 rounded border border-hairline text-slate hover:bg-vellum transition-colors"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="bg-oxide text-paper px-6 py-2 rounded hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

