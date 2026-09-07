"use client";

import { useEffect, useState } from "react";
import ComicForm from "@/components/ComicForm";
import { ComicDetail } from "../../../../../../shared/types/comic";
import { fetchAdminComic } from "@/lib/api-client";

export default function EditComicPage({ params }: { params: { id: string } }) {
  const [comic, setComic] = useState<ComicDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAdminComic(params.id)
      .then((data: ComicDetail) => setComic(data))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-oxide">{error}</div>;
  if (!comic) return <div>Not found</div>;

  return (
    <div>
      <h2 className="text-xl mb-6">Edit Comic: {comic.title}</h2>
      <ComicForm initialData={comic} isEdit={true} />
    </div>
  );
}
