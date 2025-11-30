"use client";

import { useState, type FC } from "react";
import { useSession } from "next-auth/react";
import { useMutation, usePaginatedQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import type { Id } from "convex/_generated/dataModel";

import map from "lodash/map";
import reduce from "lodash/reduce";

import { format } from "date-fns";
import { Calendar, Check, Edit2, LoaderCircle, Trash2, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

import { api } from "../../../convex/_generated/api";
import { formatCurrency } from "~/lib/utils";
import { HeaderButtons } from "../_components/HeaderButtons";
import { Input } from "~/components/ui/input";

export default function Home() {
  const session = useSession();

  const {
    status,
    results: assetsHistory,
    loadMore,
  } = usePaginatedQuery(
    api.assetRecords.getAssetHistory,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
    { initialNumItems: 10 },
  );

  const deleteAssetRecord = useMutation(api.assetRecords.deleteAssetRecord);
  const editAssetRecord = useMutation(api.assetRecords.editAssetRecord);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <HeaderButtons isLoggedIn={!!session} />

        <Card className="w-full max-w-4xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-black">
              Wealth History
            </CardTitle>
            <CardDescription>
              View and manage your recorded wealth entries
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === "LoadingFirstPage" && (
              <div className="my-6 flex w-full items-center justify-center">
                <LoaderCircle className="h-12 w-12 animate-spin" />
              </div>
            )}
            {map(assetsHistory, (record) => (
              <RecordCard
                key={record.date}
                record={record}
                onDelete={deleteAssetRecord}
                onUpdate={editAssetRecord}
              />
            ))}
          </CardContent>
        </Card>

        {status !== "Exhausted" && (
          <Button
            className="w-1/2 text-lg"
            size="lg"
            onClick={() => loadMore(5)}
          >
            Load More
          </Button>
        )}
      </div>
    </main>
  );
}

type Record = FunctionReturnType<
  typeof api.assetRecords.getAssetHistory
>["page"][number];
type DeleteCallback = ReturnType<
  typeof useMutation<typeof api.assetRecords.deleteAssetRecord>
>;
type UpdateCallback = ReturnType<
  typeof useMutation<typeof api.assetRecords.editAssetRecord>
>;

const RecordCard: FC<{
  record: Record;
  onDelete: DeleteCallback;
  onUpdate: UpdateCallback;
}> = ({ record, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [values, setValues] = useState(record.assetRecords);

  const updateRecord = (id: Id<"assetRecord">, newValue: number) => {
    setValues((prev) =>
      prev.map((v) => (v._id === id ? { ...v, value: newValue } : v)),
    );
  };

  return (
    <Card
      key={record.date}
      className="border border-gray-200 transition-shadow hover:shadow-md"
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* Card Header */}
            <div className="mb-4 flex w-full items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="font-medium text-black">
                  {format(record.date, "MMMM d, yyyy")}
                </span>
                <span className="text-sm text-gray-500">
                  {format(record.date, "h:mm a")}
                </span>
              </div>

              <div>
                {/* Edit  Button */}
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdate({
                          edits: map(values, ({ _id, value }) => ({
                            _id,
                            value,
                          })),
                        }).then(() => setIsEditing(false))
                      }
                      className="ml-2 cursor-pointer"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setValues(record.assetRecords);
                        setIsEditing(false);
                      }}
                      className="ml-2 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="ml-4 cursor-pointer"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                )}

                {/* Delete Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    onDelete({
                      ids: map(record.assetRecords, ({ _id }) => _id),
                    })
                  }
                  className="ml-4 cursor-pointer border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Assets Grid */}
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              {map(
                record.assetRecords,
                ({ value, assetId, assetName, _id }) => (
                  <div key={assetId} className="rounded-lg bg-gray-50 p-3">
                    <div className="text-sm font-medium text-gray-600">
                      {assetName}
                    </div>
                    {isEditing ? (
                      <Input
                        placeholder={value.toString()}
                        defaultValue={value}
                        onChange={(e) =>
                          updateRecord(_id, Number(e.target.value))
                        }
                      />
                    ) : (
                      <div className="my-1 text-lg font-semibold text-black">
                        {formatCurrency(value)}
                      </div>
                    )}
                  </div>
                ),
              )}
            </div>

            {/* Total Wealth */}
            <div className="flex justify-end">
              <div className="inline-block rounded-lg bg-black p-3 text-right text-white">
                <div className="text-sm opacity-80">Total Wealth</div>
                <div className="text-xl font-bold">
                  {formatCurrency(
                    reduce(
                      record.assetRecords,
                      (acc, { value }) => acc + value,
                      0,
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
