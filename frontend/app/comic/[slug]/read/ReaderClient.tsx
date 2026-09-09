"use client";

import ComicReader from "@/components/reader/ComicReader";

export default function ReaderClient({ params }: { params: { slug: string } }) {
  return <ComicReader slug={params.slug} />;
}

