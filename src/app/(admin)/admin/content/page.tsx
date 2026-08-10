import Link from "next/link";
import { requireAdmin } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";

export default async function AdminContentPage() {
  await requireAdmin();

  const posts = await prisma.contentPost.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Content</h1>
        <Link
          href="/admin/content/new"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + New Post
        </Link>
      </div>

      <div className="space-y-3">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/admin/content/${post.id}/edit`}
            className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-600"
          >
            <div>
              <p className="font-medium">{post.title}</p>
              <p className="text-xs text-zinc-500">/{post.slug}</p>
            </div>
            <span className="rounded-full bg-zinc-500/10 px-3 py-1 text-xs text-zinc-300">
              {post.status}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}