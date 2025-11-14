"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

interface CategoryDonutProps {
  data: { name: string; value: number }[];
}

const COLORS = ["#22d3ee", "#f472b6", "#facc15", "#34d399", "#c084fc", "#fb7185"];

export function CategoryDonut({ data }: CategoryDonutProps) {
  return (
    <div className="h-80 rounded-2xl border border-border bg-card p-4">
      <h3 className="text-lg font-semibold">Category Breakdown</h3>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90} paddingAngle={6}>
            {data.map((entry, index) => (
              <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
