"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";

export function PresenceHandler() {
    const updateStatus = useMutation(api.users.updateStatus);
    const { isLoaded, isSignedIn } = useUser();

    useEffect(() => {
        if (!isLoaded || !isSignedIn) return;

        // 1. Set online on mount
        updateStatus({ online: true });

        // 2. Heartbeat to keep status fresh
        const interval = setInterval(() => {
            updateStatus({ online: true });
        }, 30000); // Every 30 seconds

        // 3. Handle tab visibility
        const handleVisibilityChange = () => {
            updateStatus({ online: document.visibilityState === "visible" });
        };

        // 4. Set offline on unmount/close
        const handleBeforeUnload = () => {
            // Use Navigator.sendBeacon or similar if needed, but for now simple mutation
            updateStatus({ online: false });
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            clearInterval(interval);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            window.removeEventListener("beforeunload", handleBeforeUnload);
            updateStatus({ online: false });
        };
    }, [isLoaded, isSignedIn, updateStatus]);

    return null;
}
