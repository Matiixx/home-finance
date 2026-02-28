"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";

export function UserProvider({ children }: { children: React.ReactNode }) {
  const session = useSession();
  const upsertUser = useMutation(api.users.upsertUser);

  useEffect(() => {
    if (session.data?.user) {
      void upsertUser({
        id: session.data.user.id,
        name: session.data.user.name ?? "",
        email: session.data.user.email ?? "",
        image: session.data.user.image ?? "",
      });
    }
  }, [session.data?.user]);

  return <>{children}</>;
}
