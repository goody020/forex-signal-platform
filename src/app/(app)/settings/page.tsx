import { requireUser } from "@/server/auth/guards";
import { prisma } from "@/server/db/client";
import { updatePreferences } from "@/server/actions/notifications";

export default async function SettingsPage() {
  const session = await requireUser();

  const pref = await prisma.userNotificationPreference.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Settings</h1>

      <form
        action={updatePreferences}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6"
      >
        <h2 className="text-lg font-medium">Notification Preferences</h2>

        <div className="mt-5 space-y-4 text-sm text-zinc-300">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="inAppNewSignal"
              defaultChecked={pref?.inAppNewSignal ?? true}
              className="h-4 w-4 accent-emerald-500"
            />
            Notify me when a new signal is published
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="inAppSignalStatus"
              defaultChecked={pref?.inAppSignalStatus ?? true}
              className="h-4 w-4 accent-emerald-500"
            />
            Notify me about signal updates (TP hit, SL hit, cancelled)
          </label>

          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              name="weeklyReport"
              defaultChecked={pref?.weeklyReport ?? true}
              className="h-4 w-4 accent-emerald-500"
            />
            Weekly performance report
          </label>
        </div>

        <button className="mt-6 rounded-lg bg-emerald-600 px-5 py-2 text-sm font-medium text-white hover:bg-emerald-500">
          Save Preferences
        </button>
      </form>

      <p className="text-xs text-zinc-600">
        Email and push channels will activate once email delivery is
        connected in a later lesson.
      </p>
    </div>
  );
}