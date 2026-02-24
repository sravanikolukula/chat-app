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
    // <div className="test-red" style={{ backgroundColor: 'red', height: '100vh', display: 'flex', alignItems: 'center', justifyCenter: 'center', color: 'white', fontSize: '5rem', fontWeight: 'bold' }}>
    //   hello from inline!
    // </div>
    <Dashboard />

  );
}
