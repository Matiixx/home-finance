"use client";

import { useMemo, useState } from "react";
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
import { HeaderButtons } from "../_components/HeaderButtons";

export default function Home() {
  const session = useSession();
  const [date, setDate] = useState<Date>(dayjs().startOf("day").toDate());
  const [values, setValues] = useState<Record<string, number>>({});

  const assets = useQuery(
    api.userAssets.getUserAssets,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );
  const lastRecord = useQuery(
    api.userAssets.getLastRecord,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );
  const addRecords = useMutation(api.assetRecords.addAssetsRecords);

  const lastRecordTotal = useMemo(() => {
    return reduce(lastRecord, (acc, r) => acc + r[0]!.value, 0);
  }, [lastRecord]);
  const currentTotal = useMemo(() => {
    return reduce(values, (acc, value) => acc + value, 0);
  }, [values]);

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
        <HeaderButtons isLoggedIn={!!session} />

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
                      placeholder={
                        lastRecord?.[asset._id]
                          ? formatCurrency(lastRecord[asset._id]![0]!.value)
                          : "0.00"
                      }
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

            <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    Current Total:
                  </span>
                  <span className="text-lg font-bold text-black">
                    {" "}
                    {formatCurrency(
                      reduce(values, (acc, value) => acc + value, 0),
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Last Record:</span>
                  <span className="text-sm text-gray-700">
                    {formatCurrency(lastRecordTotal)}
                  </span>
                </div>

                <hr className="border-gray-300" />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">
                    vs Last Record:
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      currentTotal - lastRecordTotal >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {currentTotal - lastRecordTotal >= 0 ? "+" : ""}
                    {formatCurrency(currentTotal - lastRecordTotal)} ({" "}
                    {currentTotal - lastRecordTotal >= 0 ? "+" : ""}
                    {(
                      ((currentTotal - lastRecordTotal) / lastRecordTotal) *
                      100
                    ).toFixed(2)}
                    % )
                  </span>
                </div>
              </div>
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
