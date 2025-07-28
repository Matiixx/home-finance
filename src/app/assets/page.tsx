"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";

import map from "lodash/map";

import { Check, Pencil, Plus, X } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

import { api } from "../../../convex/_generated/api";

export default function Home() {
  const session = useSession();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const assets = useQuery(
    api.userAssets.getUserAssets,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );
  const addAsset = useMutation(api.userAssets.addAsset);
  const updateAsset = useMutation(api.userAssets.updateAsset);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white text-black">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <Link href="/">
          <Button variant="outline">Home</Button>
        </Link>

        <Card className="w-full max-w-2xl border border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-black">
              Manage Asset Types
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Existing Asset Types */}
            <div className="space-y-4">
              <Label className="text-base font-medium text-black">
                Your Asset Types:
              </Label>
              <div className="space-y-3">
                {map(assets, (asset) => (
                  <div
                    key={asset._id}
                    className="flex items-center space-x-3 rounded-lg border border-gray-200 p-3"
                  >
                    {editingId === asset._id ? (
                      <>
                        <div className="grid flex-1 grid-cols-2 gap-3">
                          <div>
                            <Label className="text-sm text-gray-600">
                              Name
                            </Label>
                            <Input
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Asset name"
                              className="border-gray-300 focus:border-black focus:ring-black"
                            />
                          </div>
                          <div>
                            <Label className="text-sm text-gray-600">
                              Description
                            </Label>
                            <Input
                              value={description}
                              onChange={(e) => setDescription(e.target.value)}
                              placeholder="Asset description"
                              className="border-gray-300 focus:border-black focus:ring-black"
                            />
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => {
                              return updateAsset({
                                id: asset._id,
                                name,
                                description,
                              }).then(() => {
                                setEditingId(null);
                                setName("");
                                setDescription("");
                              });
                            }}
                            className="bg-green-600 text-white hover:bg-green-700"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setName("");
                              setDescription("");
                            }}
                            className="border-gray-300 bg-transparent hover:bg-gray-50"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex-1">
                          <div className="font-medium text-black">
                            {asset.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {asset.description}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setEditingId(asset._id);
                            setName(asset.name);
                            setDescription(asset.description ?? "");
                          }}
                          className="border-gray-300 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add New Asset */}
            <div className="space-y-4 border-t border-gray-200 pt-6">
              {!isAddingNew ? (
                <Button
                  onClick={() => setIsAddingNew(true)}
                  className="bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Asset Type
                </Button>
              ) : (
                <div className="space-y-4">
                  <Label className="text-base font-medium text-black">
                    Add New Asset Type:
                  </Label>
                  <div className="flex items-end space-x-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <div className="grid flex-1 grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm text-gray-600">Name</Label>
                        <Input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g., BTC"
                          className="border-gray-300 bg-white focus:border-black focus:ring-black"
                        />
                      </div>
                      <div>
                        <Label className="text-sm text-gray-600">
                          Description
                        </Label>
                        <Input
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="e.g., Bitcoin"
                          className="border-gray-300 bg-white focus:border-black focus:ring-black"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        onClick={() => {
                          if (!session.data?.user?.id) {
                            return;
                          }

                          return addAsset({
                            name,
                            description,
                            userId: session.data.user.id,
                          }).then(() => {
                            setIsAddingNew(false);
                            setName("");
                            setDescription("");
                          });
                        }}
                        className="bg-green-600 text-white hover:bg-green-700"
                        disabled={!name.trim()}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsAddingNew(false);
                          setName("");
                          setDescription("");
                        }}
                        className="border-gray-300 bg-transparent hover:bg-gray-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
