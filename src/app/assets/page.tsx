"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMutation, useQuery } from "convex/react";

import map from "lodash/map";

import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { api } from "../../../convex/_generated/api";

export default function Home() {
  const session = useSession();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const assets = useQuery(
    api.userAssets.getUserAssets,
    session.data?.user?.id ? { userId: session.data.user.id } : "skip",
  );
  const addAsset = useMutation(api.userAssets.addAsset);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <Link href="/">
          <Button variant="outline" className="bg-black">
            Home
          </Button>
        </Link>
        <h1>Assets Page</h1>
        {session.data?.user ? (
          <p>Welcome, {session.data.user.name}!</p>
        ) : (
          <p>Please sign in</p>
        )}
        <div className="flex flex-row gap-2 bg-black p-4">
          <Input
            type="text"
            placeholder="Asset name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Asset description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <Button
            onClick={() => {
              if (!session.data?.user?.id) {
                return;
              }
              return addAsset({
                name,
                description,
                userId: session.data?.user?.id,
              }).then(() => {
                setName("");
                setDescription("");
              });
            }}
          >
            Add asset
          </Button>
        </div>
        <div>
          Your assets:
          {map(assets, (asset) => (
            <div key={asset._id}>
              {asset.name} - {asset.description}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
