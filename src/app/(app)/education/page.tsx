import Link from "next/link";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";

export default async function EducationPage() {
  await requireUser();

  const posts = await prisma.contentPost.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">Learn</h1>
        <p className="text-sm text-zinc-500">
          Education, platform updates, and risk messages.
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
          <p className="text-sm text-zinc-400">No published content yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/education/${post.slug}`}
              className="block rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 hover:border-zinc-600"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
                  {post.type.replace("_", " ")}
                </span>
                <p className="text-xs text-zinc-600">
                  {post.publishedAt
                    ? post.publishedAt.toISOString().slice(0, 10)
                    : ""}
                </p>
              </div>
              <p className="mt-3 text-lg font-medium">{post.title}</p>
              {post.excerpt && (
                <p className="mt-2 text-sm text-zinc-400">{post.excerpt}</p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}