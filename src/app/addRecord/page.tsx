"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";

import every from "lodash/every";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";
import reduce from "lodash/reduce";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { formatCurrency } from "~/lib/utils";

import { api } from "../../../convex/_generated/api";

export default function Home() {
  const session = useSession();
  const [date, setDate] = useState<Date>(dayjs().startOf("day").toDate());
  const [values, setValues] = useState<Record<string, number>>({});

  const assets = useQuery(
    api.userAssets.getUserAssets,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );
  const addRecords = useMutation(api.assetRecords.addAssetsRecords);

  const handleAddRecord = () => {
    const isValid =
      !isEmpty(values) &&
      every(assets, (asset) => values[asset._id] !== undefined);

    if (isValid && session.data?.user?.id) {
      return addRecords({
        values: map(assets, (asset) => ({
          assetId: asset._id,
          value: values[asset._id]!,
          date: dayjs(date).valueOf(),
          userId: session.data?.user?.id,
        })),
      }).then(() => {
        setValues({});
      });
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>

        <Card className="w-full max-w-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-black">
              Track Your Wealth
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label className="text-base font-medium text-black">
                Selected Date: {dayjs(date).format("DD/MM/YYYY")}
              </Label>
              <div className="flex justify-center">
                <Calendar
                  required
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-lg border bg-black"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base font-medium text-black">
                Your Assets:
              </Label>
              <div className="space-y-3">
                {map(assets, (asset, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Label className="flex-shrink-0 text-sm font-medium text-black">
                      {asset.name}
                    </Label>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={values[asset._id] ?? ""}
                      onChange={(e) =>
                        setValues({
                          ...values,
                          [asset._id]: Number(e.target.value),
                        })
                      }
                      className="flex-1 border-gray-300 focus:border-black focus:ring-black"
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <Label className="text-base font-medium text-black">
                Total Value:{" "}
                {formatCurrency(reduce(values, (acc, value) => acc + value, 0))}
              </Label>
            </div>

            <div className="pt-4">
              <Button
                onClick={handleAddRecord}
                className="w-full bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2"
                size="lg"
              >
                Add Record
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
