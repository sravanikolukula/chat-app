"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { Id } from "@/convex/_generated/dataModel";

const Dashboard = () => {
    const [selectedId, setSelectedId] = useState<Id<"conversations"> | null>(null);
    const conversations = useQuery(api.conversations.list);

    // Find the live version of the selected conversation
    const selectedConversation = conversations?.find((c: any) => c._id === selectedId) || null;

    return (
        <div className="flex md:grid md:grid-cols-[30%_70%] h-screen w-screen overflow-hidden bg-[var(--bg-main)] md:p-2">
            <div className={`${selectedId ? 'hidden md:block' : 'block'} w-full md:w-auto h-full`}>
                <Sidebar
                    selectedId={selectedId}
                    onSelectConversation={(conv) => setSelectedId(conv._id)}
                />
            </div>
            <div className={`${selectedId ? 'block' : 'hidden md:block'} flex-1 h-full`}>
                <ChatArea
                    selectedConversation={selectedConversation}
                    onBack={() => setSelectedId(null)}
                />
            </div>
        </div>
    );
};

export default Dashboard;