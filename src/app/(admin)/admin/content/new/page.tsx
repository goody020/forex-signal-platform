import { requireAdmin } from "@/server/auth/guards";
import { ContentForm } from "@/components/content/content-form";

export default async function NewContentPage() {
  await requireAdmin();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">New Post</h1>
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <ContentForm />
      </div>
    </div>
  );
}