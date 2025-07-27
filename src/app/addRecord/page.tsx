"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";
import dayjs from "dayjs";

import every from "lodash/every";
import isEmpty from "lodash/isEmpty";
import map from "lodash/map";

import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { Input } from "~/components/ui/input";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
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
        <div>
          <Calendar
            required
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-lg border bg-black"
          />
        </div>
        <div className="w-full max-w-1/2">
          Your assets:
          {map(assets, (asset) => (
            <div key={asset._id} className="flex flex-row gap-2">
              <span>{asset.name}</span>{" "}
              <Input
                type="number"
                value={values[asset._id] ?? ""}
                onChange={(e) =>
                  setValues({ ...values, [asset._id]: Number(e.target.value) })
                }
              />
            </div>
          ))}
        </div>
        <Button onClick={handleAddRecord}>Add Record</Button>
      </div>
    </main>
  );
}
