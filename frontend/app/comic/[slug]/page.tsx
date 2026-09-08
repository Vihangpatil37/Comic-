import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchComic } from "../../../lib/api-client";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  try {
    const comic = await fetchComic(params.slug);
    return {
      title: comic.title,
      description: comic.description || `Read ${comic.title}`,
      openGraph: {
        title: comic.title,
        description: comic.description || `Read ${comic.title}`,
        images: comic.coverUrl ? [comic.coverUrl] : [],
      },
    };
  } catch {
    return { title: "Not Found" };
  }
}

export default async function ComicDetail({ params }: { params: { slug: string } }) {
  let comic;
  try {
    comic = await fetchComic(params.slug);
  } catch (err) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": comic.title,
    "description": comic.description || "",
    "image": comic.coverUrl || "",
    "datePublished": comic.publishedAt || comic.createdAt || "",
    "genre": comic.category || "",
    "numberOfPages": comic.pageCount
  };

  return (
    <main className="max-w-4xl mx-auto px-6 lg:px-8 py-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="inline-block mb-12 text-slate hover:text-ink transition-colors">
        ← Archive
      </Link>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
        {/* Left Column: Info */}
        <div className="flex flex-col">
          <h1 className="font-display text-4xl lg:text-5xl mb-6 leading-tight">{comic.title}</h1>
          
          {comic.description && (
            <p className="text-lg max-w-[40ch] mb-12 whitespace-pre-wrap">{comic.description}</p>
          )}

          <div className="mt-auto grid grid-cols-2 gap-8 mb-12 border-l border-hairline pl-6 py-2">
            <div>
              <div className="font-data text-sm text-slate mb-1">Pages</div>
              <div className="font-data">{comic.pageCount}</div>
            </div>
            <div>
              <div className="font-data text-sm text-slate mb-1">Year</div>
              <div className="font-data">{comic.year}</div>
            </div>
            {comic.category && (
              <div className="col-span-2">
                <div className="font-data text-sm text-slate mb-1">Category</div>
                <div>{comic.category}</div>
              </div>
            )}
          </div>

          <Link 
            href={`/comic/${comic.slug}/read`}
            className="bg-oxide text-paper px-6 py-3 rounded font-body hover:opacity-90 transition-opacity duration-120 self-start text-center min-w-[200px]"
          >
            Read this comic
          </Link>
        </div>

        {/* Right Column: Cover */}
        <div>
          <div className="relative aspect-[2/3] w-full border border-hairline rounded bg-paper">
            {comic.coverUrl ? (
              <Image 
                src={comic.coverUrl} 
                alt={`${comic.title} cover`} 
                fill 
                className="object-cover rounded-sm"
                sizes="(min-width: 768px) 50vw, 100vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-slate">No cover</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
