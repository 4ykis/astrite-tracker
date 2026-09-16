"use client";

import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import type { Granularity, IncomePoint } from "@/lib/income";

const TABS: { value: Granularity; label: string }[] = [
  { value: "day", label: "День" },
  { value: "week", label: "Тиждень" },
  { value: "month", label: "Місяць" },
  { value: "year", label: "Рік" },
];

type ViewMode = "total" | "detail";

const VIEW_MODES: { value: ViewMode; label: string }[] = [
  { value: "total", label: "Разом" },
  { value: "detail", label: "Дохід і витрати" },
];

const POSITIVE_COLOR = "#f2c94c";
const NEGATIVE_COLOR = "#f87171";

const NO_DATA_COLOR = "#334155";

function signColor(value: number) {
  return value >= 0 ? POSITIVE_COLOR : NEGATIVE_COLOR;
}

function CustomTooltip({ active, payload, label }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      {payload.map((entry) => {
        if (typeof entry.value !== "number") {
          return (
            <p key={entry.name} className="text-sm font-medium text-slate-500">
              {entry.name}: немає даних
            </p>
          );
        }
        const color = entry.name === "Витрати" ? NEGATIVE_COLOR : signColor(entry.value);
        return (
          <p key={entry.name} className="text-sm font-medium" style={{ color }}>
            {entry.name}: {entry.value > 0 ? "+" : ""}
            {entry.value} astrite
          </p>
        );
      })}
    </div>
  );
}

export default function StatsChart({ series }: { series: Record<Granularity, IncomePoint[]> }) {
  const [granularity, setGranularity] = useState<Granularity>("day");
  const [viewMode, setViewMode] = useState<ViewMode>("total");
  const points = series[granularity];

  const totalData = points.map((p) => ({
    label: p.label,
    net: p.income === null ? null : p.income - p.spend,
  }));
  const detailData = points.map((p) => ({
    label: p.label,
    income: p.income,
    spend: p.spend,
  }));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 self-start rounded-lg bg-slate-950/60 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setGranularity(tab.value)}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                granularity === tab.value
                  ? "bg-amber-400 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-1 self-start rounded-lg bg-slate-950/60 p-1">
          {VIEW_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => setViewMode(mode.value)}
              className={`rounded-md px-3 py-1.5 text-sm transition ${
                viewMode === mode.value
                  ? "bg-amber-400 text-slate-950 font-semibold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === "total" ? (
            <BarChart data={totalData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={CustomTooltip} cursor={{ fill: "#1e293b" }} filterNull={false} />
              <Bar dataKey="net" name="Разом" radius={[4, 4, 0, 0]}>
                {totalData.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={entry.net === null ? NO_DATA_COLOR : signColor(entry.net)}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <BarChart data={detailData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="label" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip content={CustomTooltip} cursor={{ fill: "#1e293b" }} filterNull={false} />
              <Legend
                formatter={(value) => (
                  <span style={{ color: value === "Витрати" ? NEGATIVE_COLOR : POSITIVE_COLOR }}>
                    {value}
                  </span>
                )}
              />
              <Bar dataKey="income" name="Дохід" fill={POSITIVE_COLOR} radius={[4, 4, 0, 0]} />
              <Bar dataKey="spend" name="Витрати" fill={NEGATIVE_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

