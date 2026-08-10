import { redirect } from "next/navigation";
import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";

function renderBold(text: string) {
  const parts = text.split("**");
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold text-zinc-100">
        {part}
      </strong>
    ) : (
      part
    )
  );
}

function renderMarkdown(md: string) {
  return md.split("\n").map((line, i) => {
    if (line.startsWith("# "))
      return (
        <h1 key={i} className="mt-6 text-2xl font-semibold text-zinc-100">
          {line.slice(2)}
        </h1>
      );
    if (line.startsWith("## "))
      return (
        <h2 key={i} className="mt-5 text-xl font-medium text-zinc-100">
          {line.slice(3)}
        </h2>
      );
    if (line.startsWith("- "))
      return (
        <li key={i} className="ml-5 list-disc text-sm leading-6 text-zinc-300">
          {renderBold(line.slice(2))}
        </li>
      );
    if (line.trim() === "") return <div key={i} className="h-2" />;
    return (
      <p key={i} className="text-sm leading-6 text-zinc-300">
        {renderBold(line)}
      </p>
    );
  });
}

export default async function EducationDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await requireUser();
  const { slug } = await params;

  const post = await prisma.contentPost.findUnique({ where: { slug } });

  if (!post || post.status !== "PUBLISHED") redirect("/education");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <span className="rounded-full bg-sky-500/10 px-3 py-1 text-xs text-sky-300">
          {post.type.replace("_", " ")}
        </span>
        <h1 className="mt-3 text-3xl font-semibold">{post.title}</h1>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        {renderMarkdown(post.bodyMd)}
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <p className="text-sm text-amber-100/80">
          Educational content only. Nothing here is financial advice. Forex
          trading involves substantial risk.
        </p>
      </div>
    </div>
  );
}