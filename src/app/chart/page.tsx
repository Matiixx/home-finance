"use client";

import { useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { useQuery } from "convex/react";

import dayjs from "dayjs";

import forEach from "lodash/forEach";
import map from "lodash/map";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "~/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
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
  desktop: { label: "Desktop", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function Home() {
  const session = useSession();
  const [accumulative, setAccumulative] = useState(true);

  const assetsRecords = useQuery(
    api.assetRecords.getAssetRecords,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );

  const data = useMemo(() => {
    if (accumulative) {
      return assetsRecords ?? [];
    }

    const perAsset = map(assetsRecords, (record) => {
      const obj: Record<string, number> = {
        date: record.date,
        value: record.value,
      };
      forEach(
        record.assetRecords,
        (asset) => (obj[asset.assetName] = asset.value),
      );
      return obj;
    });
    return perAsset;
  }, [assetsRecords, accumulative]);

  const userAssets = useMemo(() => {
    if (!assetsRecords) return [];
    const assetNames = new Set<string>();
    forEach(assetsRecords, (record) => {
      forEach(record.assetRecords, (asset) => {
        assetNames.add(asset.assetName);
      });
    });
    return Array.from(assetNames);
  }, [assetsRecords]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <div className="container flex flex-col items-center justify-center gap-6 px-4 py-16">
        <HeaderButtons isLoggedIn={!!session} />

        <Card className="w-full border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-black">
              Chart
            </CardTitle>
            <CardDescription>
              <Button
                variant={accumulative ? "outline" : "default"}
                onClick={() => setAccumulative(!accumulative)}
              >
                {accumulative ? "Acuumulative" : "Per Asset"}
              </Button>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width={"100%"} height={500}>
              <ChartContainer config={chartConfig} className="h-full w-full">
                <AreaChart
                  data={data ?? []}
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
                    tickFormatter={(value: number) => {
                      return value.toLocaleString() + " PLN";
                    }}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" hideLabel />}
                  />

                  {accumulative ? (
                    <Area
                      dataKey="value"
                      type="linear"
                      fill="var(--color-desktop)"
                      fillOpacity={0.4}
                      stroke="var(--color-desktop)"
                    />
                  ) : (
                    map(userAssets, (assetName, index) => (
                      <Area
                        key={assetName}
                        dataKey={assetName}
                        type="linear"
                        fill={colors[index % colors.length]}
                        fillOpacity={0.2}
                        stroke={colors[index % colors.length]}
                      />
                    ))
                  )}
                </AreaChart>
              </ChartContainer>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff7300",
  "#ff0000",
  "#00ff00",
  "#0000ff",
  "#ffff00",
  "#ff00ff",
  "#00ffff",
  "#800080",
  "#008000",
  "#000080",
  "#800000",
  "#808000",
];
