import Link from "next/link";

import { auth } from "~/server/auth";
import { HydrateClient } from "~/trpc/server";

import { HeaderButtons } from "./_components/HeaderButtons";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center text-black">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <HeaderButtons isLoggedIn={!!session} />

          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-2">
              {session && (
                <div className="nter flex flex-row items-center gap-4">
                  {session && <span>Logged in as {session.user?.name}</span>}
                  <img
                    src={session?.user?.image ?? ""}
                    alt="User avatar"
                    className="h-10 w-10 rounded-full"
                  />
                </div>
              )}
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
