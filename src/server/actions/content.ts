"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/server/db/client";
import { requireAdmin } from "@/server/auth/guards";

const postSchema = z.object({
  title: z.string().min(3).max(150),
  slug: z.string().regex(/^[a-z0-9-]+$/).max(150),
  type: z.enum([
    "EDUCATION",
    "ANNOUNCEMENT",
    "MARKET_COMMENTARY",
    "RISK_MESSAGE",
  ]),
  excerpt: z.string().max(300).optional(),
  bodyMd: z.string().min(20).max(50000),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type ContentFormState = { error?: string; ok?: boolean } | null;

export async function saveContentPost(
  _prev: ContentFormState,
  formData: FormData
): Promise<ContentFormState> {
  const session = await requireAdmin();

  const parsed = postSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    type: formData.get("type"),
    excerpt: formData.get("excerpt") || undefined,
    bodyMd: formData.get("bodyMd"),
    status: formData.get("status"),
  });

  if (!parsed.success) {
    return { error: "Invalid input. Slug must be lowercase letters, numbers, dashes." };
  }

  const data = parsed.data;
  const id = formData.get("id") as string | null;
  const publishedAt = data.status === "PUBLISHED" ? new Date() : null;

  if (id) {
    await prisma.contentPost.update({
      where: { id },
      data: { ...data, publishedAt },
    });
  } else {
    await prisma.contentPost.create({
      data: { ...data, publishedAt, authorId: session.user.id },
    });
  }

  revalidatePath("/admin/content");
  revalidatePath("/education");
  return { ok: true };
}