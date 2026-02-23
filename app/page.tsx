"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useEffect } from "react";

import Dashboard from "@/components/dashboard/Dashboard";

export default function Home() {
  const { user } = useUser();
  const syncUserMutation = useMutation(api.users.syncUser);

  useEffect(() => {
    if (!user) return;

    const performSync = async () => {
      try {
        await syncUserMutation({
          clerkId: user.id,
          name: user.fullName || user.username || "Anonymous",
          image: user.imageUrl,
        });
      } catch (error) {
        console.error("Error syncing user:", error);
      }
    };

    performSync();
  }, [user, syncUserMutation]);

  return (
    <>
      <div style={{ position: "fixed", top: "1rem", right: "5rem", zIndex: 1000 }}>
        <UserButton afterSignOutUrl="/" />
      </div>
      <Dashboard />
    </>
  );
}



