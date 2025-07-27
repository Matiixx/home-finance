"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";

import dayjs from "dayjs";

import { Button } from "~/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../../../convex/_generated/api";

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function Home() {
  const session = useSession();

  const assetsRecords = useQuery(
    api.assetRecords.getAssetRecords,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
        <Link href="/">
          <Button variant="outline" className="bg-black">
            Home
          </Button>
        </Link>
        <h1>Add Record Page</h1>
        {session.data?.user ? (
          <p>Welcome, {session.data.user.name}!</p>
        ) : (
          <p>Please sign in</p>
        )}
        <ResponsiveContainer width={"100%"} height={500}>
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart
              data={assetsRecords ?? []}
              margin={{ left: 12, right: 12, bottom: 20, top: 20 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickFormatter={(value: number) => {
                  return dayjs(value).format("DD/MM/YYYY");
                }}
                tickMargin={8}
                axisLine={false}
              />
              <YAxis
                dataKey="value"
                tickFormatter={(value: number) => {
                  return value.toLocaleString() + " PLN";
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator="dot" hideLabel />}
              />

              <Area
                dataKey="value"
                type="linear"
                fill="var(--color-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
              />
            </AreaChart>
          </ChartContainer>
        </ResponsiveContainer>
      </div>
    </main>
  );
}
