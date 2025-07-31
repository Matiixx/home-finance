"use client";

import { useSession } from "next-auth/react";
import { useMutation, usePaginatedQuery, useQuery } from "convex/react";

import find from "lodash/find";
import map from "lodash/map";
import reduce from "lodash/reduce";

import { format } from "date-fns";
import { Calendar, Trash2 } from "lucide-react";

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

export default function Home() {
  const session = useSession();

  const assets = useQuery(
    api.userAssets.getUserAssets,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );

  const {
    status,
    results: assetsHistory,
    loadMore,
  } = usePaginatedQuery(
    api.assetRecords.getAssetHistory,
    session.data?.user?.id
      ? {
          userId: session.data.user.id,
        }
      : "skip",
    { initialNumItems: 10 },
  );

  const deleteAssetRecord = useMutation(api.assetRecords.deleteAssetRecord);

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
            {map(assetsHistory, (record) => {
              return (
                <Card
                  key={record.date}
                  className="border border-gray-200 transition-shadow hover:shadow-md"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Date Header */}
                        <div className="mb-4 flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-black">
                            {format(record.date, "MMMM d, yyyy")}
                          </span>
                          <span className="text-sm text-gray-500">
                            {format(record.date, "h:mm a")}
                          </span>
                        </div>

                        {/* Assets Grid */}
                        <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-4">
                          {map(record.assetRecords, ({ value, assetId }) => (
                            <div
                              key={assetId}
                              className="rounded-lg bg-gray-50 p-3"
                            >
                              <div className="text-sm font-medium text-gray-600">
                                {find(assets, (a) => a._id === assetId)?.name}
                              </div>
                              <div className="text-lg font-semibold text-black">
                                {formatCurrency(value)}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Total Wealth */}
                        <div className="flex justify-end">
                          <div className="inline-block rounded-lg bg-black p-3 text-right text-white">
                            <div className="text-sm opacity-80">
                              Total Wealth
                            </div>
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

                      {/* Delete Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          deleteAssetRecord({
                            ids: map(record.assetRecords, ({ _id }) => _id),
                          })
                        }
                        className="ml-4 border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
