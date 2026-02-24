"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "./Icons";
import { User, Conversation } from "./types";
import { ModeToggle } from "@/components/mode-toggle";
import { Id } from "@/convex/_generated/dataModel";
import { UserButton } from "@clerk/nextjs";

interface SidebarProps {
    selectedId: Id<"conversations"> | null;
    onSelectConversation: (conv: Conversation) => void;
}

const Sidebar = ({ selectedId, onSelectConversation }: SidebarProps) => {
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
        // <aside className="bg-[var(--bg-sidebar)] border-r border-[var(--border)] flex flex-col p-6 transition-all duration-300 ease-in-out rounded-l-md h-full">
        <aside className="bg-[var(--bg-sidebar)] border-r border-[var(--border)]
                 flex flex-col p-6 rounded-l-md
                 h-full min-h-0 overflow-hidden">
            {/* Header */}
            <div className="mb-8 flex justify-between items-center shrink-0">
                <h1 className="text-3xl font-bold text-[var(--accent)] tracking-tight">ChitChat</h1>
                <div className="flex items-center gap-5">
                    <ModeToggle />
                    <UserButton
                        afterSignOutUrl="/sign-in"
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-10 h-10"
                            }
                        }}
                    />
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6 shrink-0">
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
            <div className="flex gap-4 mb-6 border-b border-[var(--border)] pb-2 shrink-0">
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
            <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-2 custom-scrollbar">
                {activeTab === "conversations" ? (
                    conversations === undefined ? (
                        <div className="flex flex-col items-center justify-center h-32 text-[var(--text-muted)] animate-pulse">
                            <Icons.Dots size={24} className="mb-2" />
                            <span className="text-xs font-medium">Loading chats...</span>
                        </div>
                    ) : conversations.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--input)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
                                <Icons.Video size={20} />
                            </div>
                            <span className="text-sm font-semibold text-[var(--text-primary)] mb-1">No conversations yet</span>
                            <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                Start a new chat from the Discover tab above
                            </span>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div
                                key={conv._id}
                                onClick={() => onSelectConversation(conv)}
                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors duration-200 group ${selectedId === conv._id ? "bg-[var(--accent)] text-[var(--accent-foreground)]" : "hover:bg-[var(--input)]"}`}
                            >
                                <div className="relative">
                                    <img
                                        src={conv.otherMember?.image || "https://i.pravatar.cc/150"}
                                        alt={conv.otherMember?.name}
                                        className="w-10 h-10 rounded-full object-cover bg-[var(--border)]"
                                    />
                                    <div className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 transition-all ${conv.otherMember?.online ? "bg-[hsl(var(--status-online))] border-background" : "bg-transparent border-border border-gray-950 dark:border-gray-300"}`}></div>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="font-medium text-sm truncate">{conv.otherMember?.name}</div>
                                        {conv.unreadCount > 0 && selectedId !== conv._id && (
                                            <div className="min-w-[18px] h-[18px] flex items-center justify-center bg-[hsl(var(--status-online))] text-white text-[9px] font-bold rounded-full px-1 shadow-sm animate-in zoom-in duration-300">
                                                {conv.unreadCount}
                                            </div>
                                        )}
                                    </div>
                                    <div className={`text-[11px] truncate ${selectedId === conv._id ? "opacity-80" : "text-[var(--text-muted)]"}`}>
                                        {conv.lastMessage?.body || "Start a conversation..."}
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                ) : (
                    filteredUsers === undefined ? (
                        <div className="flex flex-col items-center justify-center h-32 text-[var(--text-muted)] animate-pulse">
                            <Icons.Dots size={24} className="mb-2" />
                            <span className="text-xs font-medium">Searching users...</span>
                        </div>
                    ) : filteredUsers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                            <div className="w-12 h-12 rounded-2xl bg-[var(--input)] flex items-center justify-center mb-4 text-[var(--text-muted)]">
                                <Icons.Search size={20} />
                            </div>
                            <span className="text-sm font-semibold text-[var(--text-primary)] mb-1">No users found</span>
                            <span className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                {searchTerm ? `No results for "${searchTerm}"` : "Wait for others to join ChitChat!"}
                            </span>
                        </div>
                    ) : (
                        filteredUsers.map((user) => (
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
                                    <div className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 transition-all ${user.online ? "bg-[hsl(var(--status-online))] border-background" : "bg-transparent border-border border-gray-950 dark:border-gray-300"}`}></div>
                                </div>

                                <div className="flex-1 overflow-hidden">
                                    <div className="font-medium text-sm truncate">{user.name}</div>
                                    <div className="text-[11px] text-[var(--text-muted)]">
                                        Click to message
                                    </div>
                                </div>
                            </div>
                        ))
                    )
                )}
            </div>


        </aside>
    );
};

export default Sidebar;
