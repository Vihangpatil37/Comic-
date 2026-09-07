// log when comic created
// better pdf validation error message
import { Router, Request, Response } from "express";
import multer from "multer";
import { z } from "zod";
import prisma from "../lib/prisma";
import { supabase } from "../lib/supabase-server";

const router = Router();
const STORAGE_BUCKET_COVERS = process.env.STORAGE_BUCKET_COVERS || "covers";
const STORAGE_BUCKET_PDFS = process.env.STORAGE_BUCKET_PDFS || "comics-pdf";

// multer config - 50MB limit for pdfs, 5MB for covers checked manually
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit globally, we'll enforce 5MB on covers manually
  }
});

function getCoverUrl(coverKey: string | null): string | null {
  if (!coverKey) return null;
  const { data } = supabase.storage.from(STORAGE_BUCKET_COVERS).getPublicUrl(coverKey);
  return data.publicUrl;
}

// slug generator - turns title into url friendly string
function generateSlug(title: string): string {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

// Ensure unique slug
async function getUniqueSlug(title: string, excludeId?: string): Promise<string> {
  let baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;
  while (true) {
    const existing = await prisma.comic.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) break;
    counter++;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

router.get("/session", (req: Request, res: Response) => {
  res.json({ email: (req as any).adminEmail });
});

router.get("/", async (req: Request, res: Response) => {
  const status = req.query.status as string;
  const where = status ? { status: status as "DRAFT" | "PUBLISHED" } : {};
  
  const comics = await prisma.comic.findMany({
    where,
    orderBy: { createdAt: 'desc' }
  });

  res.json(comics.map(c => ({ ...c, coverUrl: getCoverUrl(c.coverKey) })));
});

router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  const comic = await prisma.comic.findUnique({
    where: { id: req.params.id as string }
  });

  if (!comic) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  res.json({ ...comic, coverUrl: getCoverUrl(comic.coverKey) });
});

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  year: z.preprocess((a) => parseInt(a as string, 10), z.number()),
  pageCount: z.preprocess((a) => parseInt(a as string, 10), z.number()),
});

// create endpoint - handles pdf and cover upload
router.post("/", upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = createSchema.parse(req.body);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files?.pdf?.[0]) {
      res.status(400).json({ error: "PDF file is required" });
      return;
    }
    
    if (!files?.cover?.[0]) {
      res.status(400).json({ error: "Cover image is required" });
      return;
    }

    const pdfFile = files.pdf[0];
    const coverFile = files.cover[0];

    if (pdfFile.mimetype !== "application/pdf") {
      res.status(400).json({ error: "Invalid PDF file" });
      return;
    }
    if (!coverFile.mimetype.startsWith("image/")) {
      res.status(400).json({ error: "Invalid cover image" });
      return;
    }
    if (coverFile.size > 5 * 1024 * 1024) {
      res.status(400).json({ error: "Cover must be under 5MB" });
      return;
    }

    const slug = await getUniqueSlug(parsed.title);
    // Use a temp ID for storage paths or just a timestamp
    const uniqueId = Date.now().toString();
    const pdfExt = pdfFile.originalname.split('.').pop();
    const coverExt = coverFile.originalname.split('.').pop();
    const pdfKey = `pdfs/${slug}-${uniqueId}.${pdfExt}`;
    const coverKey = `covers/${slug}-${uniqueId}.${coverExt}`;

    await Promise.all([
      supabase.storage.from(STORAGE_BUCKET_PDFS).upload(pdfKey, pdfFile.buffer, { contentType: pdfFile.mimetype }),
      supabase.storage.from(STORAGE_BUCKET_COVERS).upload(coverKey, coverFile.buffer, { contentType: coverFile.mimetype })
    ]);

    const comic = await console.log("Creating comic:", slug); prisma.comic.create({
      data: {
        ...parsed,
        slug,
        pdfKey,
        coverKey,
        status: "DRAFT"
      }
    });

    res.status(201).json({ ...comic, coverUrl: getCoverUrl(comic.coverKey) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: err.issues });
    } else {
      res.status(500).json({ error: "Internal error" });
    }
  }
});

router.patch("/:id", upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req: Request, res: Response): Promise<void> => {
  try {
    const existing = await prisma.comic.findUnique({ where: { id: req.params.id as string } });
    if (!existing) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    // Making everything optional for PATCH
    const patchSchema = createSchema.partial();
    const parsed = patchSchema.parse(req.body);
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    
    let pdfKey = existing.pdfKey;
    let coverKey = existing.coverKey;

    if (files?.pdf?.[0]) {
      const pdfFile = files.pdf[0];
      if (pdfFile.mimetype !== "application/pdf") {
        res.status(400).json({ error: "Invalid PDF file" });
        return;
      }
      const pdfExt = pdfFile.originalname.split('.').pop();
      pdfKey = `pdfs/${existing.slug}-${Date.now()}.${pdfExt}`;
      await supabase.storage.from(STORAGE_BUCKET_PDFS).upload(pdfKey, pdfFile.buffer, { contentType: pdfFile.mimetype });
      await supabase.storage.from(STORAGE_BUCKET_PDFS).remove([existing.pdfKey]);
    }

    if (files?.cover?.[0]) {
      const coverFile = files.cover[0];
      if (!coverFile.mimetype.startsWith("image/")) {
        res.status(400).json({ error: "Invalid cover image" });
        return;
      }
      if (coverFile.size > 5 * 1024 * 1024) {
        res.status(400).json({ error: "Cover must be under 5MB" });
        return;
      }
      const coverExt = coverFile.originalname.split('.').pop();
      coverKey = `covers/${existing.slug}-${Date.now()}.${coverExt}`;
      await supabase.storage.from(STORAGE_BUCKET_COVERS).upload(coverKey, coverFile.buffer, { contentType: coverFile.mimetype });
      if (existing.coverKey) {
        await supabase.storage.from(STORAGE_BUCKET_COVERS).remove([existing.coverKey]);
      }
    }

    let slug = existing.slug;
    if (parsed.title && parsed.title !== existing.title) {
      slug = await getUniqueSlug(parsed.title, existing.id);
    }

    const updated = await prisma.comic.update({
      where: { id: existing.id },
      data: {
        ...parsed,
        slug,
        pdfKey,
        coverKey
      }
    });

    res.json({ ...updated, coverUrl: getCoverUrl(updated.coverKey) });
  } catch (err) {
    res.status(400).json({ error: "Bad request" });
  }
});

router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  const existing = await prisma.comic.findUnique({ where: { id: req.params.id as string } });
  if (!existing) {
    res.status(404).json({ error: "not_found" });
    return;
  }

  await Promise.all([
    supabase.storage.from(STORAGE_BUCKET_PDFS).remove([existing.pdfKey]),
    ...(existing.coverKey ? [supabase.storage.from(STORAGE_BUCKET_COVERS).remove([existing.coverKey])] : [])
  ]);

  await prisma.comic.delete({ where: { id: existing.id } });
  res.status(204).send();
});

// publish logic - assigns entry number and sets status to PUBLISHED
router.post("/:id/publish", async (req: Request, res: Response): Promise<void> => {
  try {
    const comic = await prisma.comic.findUnique({ where: { id: req.params.id as string } });
    if (!comic) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    if (comic.status === "PUBLISHED") {
      res.json({ ...comic, coverUrl: getCoverUrl(comic.coverKey) });
      return;
    }

    const updated = await // transaction - ensures entryNumber is assigned atomically
        prisma.$transaction(async (tx) => {
      let entryNumber = comic.entryNumber;
      if (entryNumber === null) {
        const maxEntry = await tx.comic.aggregate({
          _max: { entryNumber: true }
        });
        entryNumber = (maxEntry._max.entryNumber || 0) + 1;
      }

      return tx.comic.update({
        where: { id: comic.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          entryNumber
        }
      });
    });

    res.json({ ...updated, coverUrl: getCoverUrl(updated.coverKey) });
  } catch (err) {
    res.status(500).json({ error: "Failed to publish" });
  }
});

// unpublish route - sets back to DRAFT
router.post("/:id/unpublish", async (req: Request, res: Response): Promise<void> => {
  try {
    const comic = await prisma.comic.findUnique({ where: { id: req.params.id as string } });
    if (!comic) {
      res.status(404).json({ error: "not_found" });
      return;
    }

    const updated = await prisma.comic.update({
      where: { id: comic.id },
      data: {
        status: "DRAFT"
      }
    });

    res.json({ ...updated, coverUrl: getCoverUrl(updated.coverKey) });
  } catch (err) {
    res.status(500).json({ error: "Failed to unpublish" });
  }
});

export default router;









