"use client";

import React, { useState } from "react";
import Sidebar from "./Sidebar";
import ChatArea from "./ChatArea";
import RightSidebar from "./RightSidebar";
import { Conversation } from "./types";

const Dashboard = () => {
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    return (
        <div className="grid grid-cols-[25%_50%_25%] h-screen w-screen overflow-hidden bg-[var(--bg-main)]">
            <Sidebar
                selectedConversation={selectedConversation}
                onSelectConversation={setSelectedConversation}
            />
            <ChatArea selectedConversation={selectedConversation} />
            <RightSidebar selectedConversation={selectedConversation} />
        </div>
    );
};

export default Dashboard;