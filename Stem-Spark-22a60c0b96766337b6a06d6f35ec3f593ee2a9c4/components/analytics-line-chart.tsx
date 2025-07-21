"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface TimeSeriesData {
  time: string;
  [key: string]: number | string;
}

interface AnalyticsLineChartProps {
  data: TimeSeriesData[];
  lines: { dataKey: string; stroke: string; name: string }[];
  title: string;
  description: string;
}

export function AnalyticsLineChart({ data, lines, title, description }: AnalyticsLineChartProps) {
  return (
    <div className="p-4 border rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-sm text-gray-500 mb-4">{description}</p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart
            data={data}
            margin={{
              top: 5, right: 30, left: 20, bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            {lines.map((line) => (
              <Line key={line.dataKey} type="monotone" dataKey={line.dataKey} name={line.name} stroke={line.stroke} strokeWidth={2} activeDot={{ r: 8 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 