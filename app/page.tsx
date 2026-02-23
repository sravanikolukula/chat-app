"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

export default function Home() {
  const { user } = useUser();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (!user) return;

    const syncUser = async () => {
      try {
        await storeUser({
          clerkId: user.id,
          name: user.fullName || user.username || "Anonymous",
          image: user.imageUrl,
        });
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    syncUser();
  }, [user, storeUser]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="absolute top-8 right-8">
        <UserButton />
      </div>
      <h1 className="text-6xl font-bold text-center">
        Hello {user?.firstName || "World"}
      </h1>
    </main>
  );
}



