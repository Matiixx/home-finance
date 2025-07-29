"use client";

import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";

import dayjs from "dayjs";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "../../../convex/_generated/api";
import { HeaderButtons } from "../_components/HeaderButtons";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
        <HeaderButtons />

        <Card className="w-full border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-black">
              Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
