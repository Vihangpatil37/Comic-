import { Metadata } from "next";
import { fetchComic } from "../../../../lib/api-client";
import ReaderClient from "./ReaderClient";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const comic = await fetchComic(params.slug);
    return {
      title: `Reading: ${comic.title} | Comic Archive`,
      description: `Read ${comic.title} in the immersive reader.`,
      openGraph: {
        title: `Reading: ${comic.title}`,
        description: `Read ${comic.title} in the immersive reader.`,
        images: comic.coverUrl ? [comic.coverUrl] : [],
      },
    };
  } catch {
    return { title: "Reader | Not Found" };
  }
}

export default function ReadPage({ params }: { params: { slug: string } }) {
  return <ReaderClient params={params} />;
}
