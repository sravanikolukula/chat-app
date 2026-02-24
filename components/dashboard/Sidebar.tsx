"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "./Icons";
import { User, Conversation } from "./types";
import { ModeToggle } from "@/components/mode-toggle";
import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
    selectedConversation: Conversation | null;
    onSelectConversation: (conv: Conversation) => void;
}

const Sidebar = ({ selectedConversation, onSelectConversation }: SidebarProps) => {
    const [activeTab, setActiveTab] = useState<"conversations" | "users">("conversations");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredUsers = useQuery(api.users.list, { searchTerm });
    const conversations = useQuery(api.conversations.list);
    const createConversation = useMutation(api.conversations.getOrCreate);

    React.useEffect(() => {
        if (filteredUsers) {
            console.log("Sidebar received filteredUsers:", filteredUsers);
        }
    }, [filteredUsers]);

    const handleSelectUser = async (user: User) => {
        try {
            const conversationId = await createConversation({ userId: user._id });
            setActiveTab("conversations");
        } catch (error) {
            console.error("Error creating conversation:", error);
        }
    };

    return (
        <aside className="bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col p-6 transition-all duration-300 ease-in-out">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-[var(--accent)] tracking-tight">ChitChat</h1>
                <ModeToggle />
            </div>

            {/* Search */}
            <div className="relative mb-6">
                <Icons.Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
                    size={18}
                />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--input)] color-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-colors duration-200"
                />
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-6 border-b border-[var(--border)] pb-2">
                <div
                    onClick={() => setActiveTab("conversations")}
                    className={`pb-2 text-sm font-medium cursor-pointer relative transition-colors duration-200 ${activeTab === "conversations" ? "text-[var(--accent)] after:absolute after:bottom-[-9px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--accent)] after:rounded-full" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                >
                    Chats
                </div>

                <div
                    onClick={() => setActiveTab("users")}
                    className={`pb-2 text-sm font-medium cursor-pointer relative transition-colors duration-200 ${activeTab === "users" ? "text-[var(--accent)] after:absolute after:bottom-[-9px] after:left-0 after:w-full after:h-[2px] after:bg-[var(--accent)] after:rounded-full" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"}`}
                >
                    Discover
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2 custom-scrollbar">
                {activeTab === "conversations" ? (
                    conversations?.map((conv) => (
                        <div
                            key={conv._id}
                            onClick={() => onSelectConversation(conv)}
                            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 group ${selectedConversation?._id === conv._id ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "hover:bg-[var(--input)]"}`}
                        >
                            <div className="relative">
                                <img
                                    src={conv.otherMember?.image || "https://i.pravatar.cc/150"}
                                    alt={conv.otherMember?.name}
                                    className="w-10 h-10 rounded-full object-cover bg-[var(--border)]"
                                />
                                <div className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 border-[var(--bg-sidebar)] ${conv.otherMember?.online ? "bg-[var(--status-online)]" : "bg-[var(--status-offline)]"}`}></div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium text-sm truncate">{conv.otherMember?.name}</div>
                                <div className={`text-[11px] truncate ${selectedConversation?._id === conv._id ? "opacity-80" : "text-[var(--text-muted)]"}`}>
                                    {conv.lastMessage?.body || "Start a conversation..."}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    filteredUsers?.map((user) => (
                        <div
                            key={user._id}
                            onClick={() => handleSelectUser(user)}
                            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 hover:bg-[var(--input)]"
                        >
                            <div className="relative">
                                <img
                                    src={user.image}
                                    alt={user.name}
                                    className="w-10 h-10 rounded-full object-cover bg-[var(--border)]"
                                />
                                <div className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 border-[var(--bg-sidebar)] ${user.online ? "bg-[var(--status-online)]" : "bg-[var(--status-offline)]"}`}></div>
                            </div>

                            <div className="flex-1 overflow-hidden">
                                <div className="font-medium text-sm truncate">{user.name}</div>
                                <div className="text-[11px] text-[var(--text-muted)]">
                                    Click to message
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* User Profile / Footer */}
            <div className="mt-6 pt-4 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 p-2 rounded-xl bg-[var(--input)]">
                    <UserButton showName={true} />
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
