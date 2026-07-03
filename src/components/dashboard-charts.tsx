'use client';

import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

interface ChartData {
  radarData: Array<{ subject: string; A: number; fullMark: number }>;
  trendData: Array<{ name: string; score: number; date: string; role: string }>;
}

export function DashboardCharts({ radarData, trendData }: ChartData) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!isMounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-[300px]">
        <div className="h-72 rounded-2xl border border-zinc-800 bg-zinc-900/10 animate-pulse" />
        <div className="h-72 rounded-2xl border border-zinc-800 bg-zinc-900/10 animate-pulse" />
      </div>
    );
  }

  const hasData = trendData.length > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Line Chart: Improvement Trend */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Improvement Trend</h3>
        <div className="h-64 w-full">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke="#71717a"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={11}
                  domain={[0, 100]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 shadow-xl">
                          <p className="text-xs text-zinc-400">{data.date}</p>
                          <p className="text-sm font-bold text-white mt-1">Score: {data.score}</p>
                          <p className="text-xs text-indigo-400 font-medium mt-0.5">{data.role}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="url(#line-grad)"
                  strokeWidth={3}
                  dot={{ r: 4, stroke: '#6E7DFF', strokeWidth: 2, fill: '#050816' }}
                  activeDot={{ r: 6 }}
                />
                <defs>
                  <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6E7DFF" />
                    <stop offset="50%" stopColor="#8B5CF6" />
                    <stop offset="100%" stopColor="#00D9FF" />
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-550">
              Complete interviews to visualize your improvement trend.
            </div>
          )}
        </div>
      </div>

      {/* Radar Chart: Skill Breakdown */}
      <div className="rounded-2xl border border-zinc-800 bg-[#0A1022]/60 p-6 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Competency Map</h3>
        <div className="h-64 w-full flex items-center justify-center">
          {hasData ? (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.06)" />
                <PolarAngleAxis
                  dataKey="subject"
                  stroke="#98A2B3"
                  fontSize={10}
                />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  stroke="rgba(255,255,255,0.2)"
                  fontSize={8}
                  tickLine={false}
                />
                <Radar
                  name="Candidate"
                  dataKey="A"
                  stroke="#6E7DFF"
                  fill="#8B5CF6"
                  fillOpacity={0.2}
                  strokeWidth={2.5}
                />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-zinc-550">
              Competencies will populate after your first feedback report.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
