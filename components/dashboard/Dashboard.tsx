"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import { Conversation } from "./types";

const Dashboard = () => {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    return (
        <div className="flex md:grid md:grid-cols-[30%_70%] h-screen w-screen overflow-hidden bg-[var(--bg-main)] md:p-2">
            <div className={`${selectedConversation ? 'hidden md:block' : 'block'} w-full md:w-auto h-full`}>
                <Sidebar
                    selectedConversation={selectedConversation}
                    onSelectConversation={setSelectedConversation}
                />
            </div>
            <div className={`${selectedConversation ? 'block' : 'hidden md:block'} flex-1 h-full`}>
                <ChatArea
                    selectedConversation={selectedConversation}
                    onBack={() => setSelectedConversation(null)}
                />
            </div>
        </div>
    );
};

export default Dashboard;