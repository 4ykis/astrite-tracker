import { parseDateInput, toDayStart } from "@/lib/date";
import { getResourcesAsOf } from "@/lib/resources";
import { requireUserId } from "@/lib/session";
import ResourcesForm from "./ResourcesForm";

export const dynamic = "force-dynamic";

export default async function ResourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const { date: dateParam } = await searchParams;
  const today = toDayStart(new Date());
  const parsed = dateParam && /^\d{4}-\d{2}-\d{2}$/.test(dateParam) ? parseDateInput(dateParam) : null;
  const date = parsed && parsed <= today ? parsed : today;
  const amounts = await getResourcesAsOf(await requireUserId(), date);
  const dateValue = date.toISOString().slice(0, 10);

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Ресурси</h1>
      <ResourcesForm key={dateValue} amounts={amounts} date={dateValue} today={today.toISOString().slice(0, 10)} />
    </div>
  );
}
