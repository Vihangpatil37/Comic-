// mobile view shows thumbnail directly, desktop shows preview pane
// detailsCache stores fetched comic details
// IndexClient - card catalog with hover preview
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ComicSummary, ComicDetail } from "../../shared/types/comic";
import { fetchComic } from "../lib/api-client";

export default function IndexClient({ initialComics }: { initialComics: ComicSummary[] }) {
  // cache for comic details to avoid refetching
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailsCache, setDetailsCache] = useState<Record<string, ComicDetail>>({});
  
  const selectedComic = initialComics[selectedIndex];

  // Fetch details for the selected comic to get the description
  useEffect(() => {
    if (!selectedComic) return;
    if (detailsCache[selectedComic.slug]) return;

    fetchComic(selectedComic.slug)
      .then(detail => {
        setDetailsCache(prev => ({ ...prev, [selectedComic.slug]: detail }));
      })
      .catch(console.error);
  }, [selectedComic, detailsCache]);

  if (!initialComics.length) {
    return (
      <main className="px-6 lg:px-8 pb-12 h-full flex items-center justify-center">
        <div className="text-slate">No comics published yet.</div>
      </main>
    );
  }

  return (
    <main className="px-6 lg:px-8 pb-12 h-full">
      <h1 className="sr-only">Comic Archive</h1>
      <div className="flex flex-col md:flex-row gap-8 lg:gap-16 max-w-[1400px] mx-auto h-[calc(100vh-140px)]">
        
        {/* Index Column */}
        <div className="w-full md:w-64 lg:w-80 flex flex-col gap-2 overflow-y-auto pr-4 custom-scrollbar shrink-0">
          {initialComics.map((comic, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <div 
                key={comic.id}
                onMouseEnter={() => setSelectedIndex(idx)}
                onClick={() => setSelectedIndex(idx)}
                className={`group cursor-pointer p-4 rounded border ${isSelected ? 'border-hairline bg-paper' : 'border-transparent hover:border-hairline hover:bg-paper/50'} transition-colors duration-120 flex flex-col`}
              >
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-data text-sm text-slate">
                    {comic.entryNumber?.toString().padStart(3, '0')} {isSelected && <span className="hidden md:inline ml-1">· selected</span>}
                  </span>
                  <span className="font-data text-sm text-slate">{comic.year}</span>
                </div>
                <h2 className="font-display text-lg group-hover:text-oxide transition-colors">
                  {comic.title}
                </h2>

                {/* Mobile-only view: show thumbnail directly in list */}
                <div className="md:hidden mt-4">
                   <Link href={`/comic/${comic.slug}`} className="block relative aspect-[2/3] w-full rounded overflow-hidden border border-hairline bg-vellum">
                     {comic.coverUrl && (
                       <Image 
                         src={comic.coverUrl} 
                         alt={comic.title} 
                         fill 
                         className="object-cover"
                         sizes="(max-width: 768px) 100vw"
                       />
                     )}
                   </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Display Pane (Desktop) */}
        <div className="hidden md:flex flex-1 relative bg-paper border border-hairline rounded overflow-hidden">
          {initialComics.map((comic, idx) => {
            const isSelected = idx === selectedIndex;
            const detail = detailsCache[comic.slug];
            
            return (
              <div 
                key={comic.id} 
                className={`absolute inset-0 flex transition-opacity duration-200 motion-reduce:transition-none motion-reduce:duration-0 ${isSelected ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}
              >
                <Link href={`/comic/${comic.slug}`} className="absolute inset-0 block z-0">
                  {comic.coverUrl && (
                    <Image 
                      src={comic.coverUrl} 
                      alt={comic.title} 
                      fill 
                      className="object-cover opacity-30 hover:opacity-40 transition-opacity"
                      sizes="(min-width: 768px) 50vw"
                      priority={idx === 0}
                    />
                  )}
                </Link>
                
                <div className="relative z-10 flex flex-col justify-end p-8 lg:p-12 w-full bg-gradient-to-t from-paper/90 via-paper/50 to-transparent">
                  <h2 className="font-display text-5xl lg:text-7xl mb-4 leading-tight">{comic.title}</h2>
                  {detail ? (
                    <p className="text-lg max-w-[48ch] mb-8">{detail.description}</p>
                  ) : (
                    <div className="h-14 mb-8 opacity-50 flex items-center">Loading...</div>
                  )}
                  
                  <div className="flex flex-wrap gap-8 items-end justify-between">
                    <div className="flex gap-8">
                      <div>
                        <div className="font-data text-sm text-slate mb-1">Pages</div>
                        <div className="font-data">{comic.pageCount}</div>
                      </div>
                      <div>
                        <div className="font-data text-sm text-slate mb-1">Year</div>
                        <div className="font-data">{comic.year}</div>
                      </div>
                      {comic.category && (
                        <div>
                          <div className="font-data text-sm text-slate mb-1">Category</div>
                          <div>{comic.category}</div>
                        </div>
                      )}
                    </div>
                    
                    <Link 
                      href={`/comic/${comic.slug}`}
                      className="bg-oxide text-paper px-6 py-3 rounded font-body hover:opacity-90 transition-opacity duration-120 shrink-0"
                    >
                      Read this comic
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </main>
  );
}




