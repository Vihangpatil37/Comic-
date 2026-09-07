// storage buckets: covers (public) and comics-pdf (private)
// public comics router - no auth needed
import { Router, Request, Response } from "express";
import prisma from "../lib/prisma";
import { supabase } from "../lib/supabase-server";

const router = Router();
const STORAGE_BUCKET_COVERS = process.env.STORAGE_BUCKET_COVERS || "covers";
const STORAGE_BUCKET_PDFS = process.env.STORAGE_BUCKET_PDFS || "comics-pdf";
const SIGNED_URL_EXPIRY = parseInt(process.env.SIGNED_URL_EXPIRY_SECONDS || "3600", 10);

function getCoverUrl(coverKey: string | null): string | null {
  if (!coverKey) return null;
  const { data } = supabase.storage.from(STORAGE_BUCKET_COVERS).getPublicUrl(coverKey);
  return data.publicUrl;
}

router.get("/", async (req: Request, res: Response) => {
  const category = req.query.category as string;
  const page = parseInt(req.query.page as string || "1", 10);
  const limit = parseInt(req.query.limit as string || "20", 10);
  const skip = (page - 1) * limit;

  const where = {
    status: "PUBLISHED" as const,
    ...(category ? { category } : {})
  };

  const [total, records] = await Promise.all([
    prisma.comic.count({ where }),
    prisma.comic.findMany({
      where,
      orderBy: { entryNumber: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        slug: true,
        title: true,
        category: true,
        pageCount: true,
        year: true,
        entryNumber: true,
        coverKey: true,
        status: true
      }
    })
  ]);

  const comics = records.map(comic => ({
    ...comic,
    coverUrl: getCoverUrl(comic.coverKey)
  }));

  res.json({
    comics,
    total,
    page,
    limit
  });
});

router.get("/:slug", async (req: Request, res: Response): Promise<void> => {
  const comic = await prisma.comic.findUnique({
    where: { slug: req.params.slug as string }
  });

  if (!comic || comic.status !== "PUBLISHED") {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const detail = {
    ...comic,
    coverUrl: getCoverUrl(comic.coverKey)
  };

  res.json(detail);
});

router.get("/:slug/read", async (req: Request, res: Response): Promise<void> => {
  const comic = await prisma.comic.findUnique({
    where: { slug: req.params.slug as string }
  });

  if (!comic || comic.status !== "PUBLISHED") {
    res.status(404).json({ error: "not_found" });
    return;
  }

  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET_PDFS)
    .createSignedUrl(comic.pdfKey, SIGNED_URL_EXPIRY);

  if (error || !data) {
    res.status(500).json({ error: "failed_to_generate_url" });
    return;
  }

  const expiresAt = new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString();

  res.json({
    pdfUrl: data.signedUrl,
    expiresAt
  });
});

export default router;



