import { ComicSummary, ComicDetail } from "../../shared/types/comic";

export const MOCK_COMICS: ComicSummary[] = [
  {
    id: "1",
    slug: "mcp",
    title: "MCP",
    category: "AI / technology",
    pageCount: 22,
    year: 2026,
    entryNumber: 3,
    coverUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    status: "PUBLISHED",
  },
  {
    id: "2",
    slug: "rag",
    title: "RAG",
    category: "AI / technology",
    pageCount: 15,
    year: 2026,
    entryNumber: 2,
    coverUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
    status: "PUBLISHED",
  },
  {
    id: "3",
    slug: "ai-agents",
    title: "AI agents",
    category: "AI / technology",
    pageCount: 18,
    year: 2026,
    entryNumber: 1,
    coverUrl: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000&auto=format&fit=crop",
    status: "PUBLISHED",
  }
];

export const MOCK_COMIC_DETAILS: Record<string, ComicDetail> = MOCK_COMICS.reduce((acc, comic) => {
  acc[comic.slug] = {
    ...comic,
    description: "A field guide to the Model Context Protocol and why it matters for agent tooling.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
  };
  return acc;
}, {} as Record<string, ComicDetail>);
