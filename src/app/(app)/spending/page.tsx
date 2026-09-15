import Card from "@/components/Card";
import SpendForm from "./SpendForm";

export const dynamic = "force-dynamic";

export default function SpendingPage() {
  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-lg font-semibold text-slate-100">Витрати</h1>

      <Card>
        <SpendForm />
      </Card>
    </div>
  );
}
