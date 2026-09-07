export type ComicSummary = {
  id: string;
  slug: string;
  title: string;
  category: string | null;
  pageCount: number;
  year: number;
  entryNumber: number | null;
  coverUrl: string | null;
  status: "DRAFT" | "PUBLISHED";
};

export type ComicDetail = ComicSummary & {
  description: string | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
};
