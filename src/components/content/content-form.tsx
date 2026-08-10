"use client";

import { useActionState } from "react";
import {
  saveContentPost,
  type ContentFormState,
} from "@/server/actions/content";

const inputClass =
  "mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm outline-none focus:border-emerald-500";

export function ContentForm({
  initial,
}: {
  initial?: {
    id: string;
    title: string;
    slug: string;
    type: string;
    excerpt: string | null;
    bodyMd: string;
    status: string;
  };
}) {
  const [state, formAction, pending] = useActionState<
    ContentFormState,
    FormData
  >(saveContentPost, null);

  return (
    <form action={formAction} className="space-y-4">
      {initial && <input type="hidden" name="id" value={initial.id} />}

      {state?.error && (
        <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Saved.{" "}
          <a href="/admin/content" className="underline">
            Back to content list
          </a>
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm text-zinc-300">Title</label>
          <input
            name="title"
            required
            defaultValue={initial?.title}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300">Slug (url)</label>
          <input
            name="slug"
            required
            defaultValue={initial?.slug}
            placeholder="what-is-forex"
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-sm text-zinc-300">Type</label>
          <select name="type" defaultValue={initial?.type} className={inputClass}>
            <option value="EDUCATION">Education</option>
            <option value="ANNOUNCEMENT">Announcement</option>
            <option value="MARKET_COMMENTARY">Market Commentary</option>
            <option value="RISK_MESSAGE">Risk Message</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-zinc-300">Status</label>
          <select
            name="status"
            defaultValue={initial?.status ?? "DRAFT"}
            className={inputClass}
          >
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-zinc-300">Excerpt (optional)</label>
        <input
          name="excerpt"
          defaultValue={initial?.excerpt ?? ""}
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm text-zinc-300">Body (markdown)</label>
        <textarea
          name="bodyMd"
          rows={12}
          required
          defaultValue={initial?.bodyMd}
          className={inputClass}
        />
        <p className="mt-1 text-xs text-zinc-600">
          Supports # heading, ## subheading, - bullets, **bold**.
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save Post"}
      </button>
    </form>
  );
}