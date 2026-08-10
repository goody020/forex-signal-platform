import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { ContentForm } from "@/components/content/content-form";
import { redirect } from "next/navigation";

export default async function EditContentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;

  const post = await prisma.contentPost.findUnique({ where: { id } });
  if (!post) redirect("/admin/content");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Edit Post</h1>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <ContentForm
          initial={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            type: post.type,
            excerpt: post.excerpt,
            bodyMd: post.bodyMd,
            status: post.status,
          }}
        />
      </div>
    </div>
  );
}