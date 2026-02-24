"use client";

import React from "react";
import { Icons } from "./Icons";
import { Conversation } from "./types";
import { Button } from "../ui/button";

interface RightSidebarProps {
    selectedConversation: Conversation | null;
}

const RightSidebar = ({ selectedConversation }: RightSidebarProps) => {
    if (!selectedConversation) {
        return (
            <aside className="bg-[var(--bg-right)] border-l border-[var(--border)] p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-[var(--input)] flex items-center justify-center mb-4 text-[var(--text-muted)] shadow-sm">
                    <Icons.Dots size={24} />
                </div>
                <p className="text-[var(--text-muted)] text-[11px] max-w-[180px] leading-relaxed font-medium">
                    Select a conversation to view contact info and shared files
                </p>
            </aside>
        );
    }

    const { otherMember } = selectedConversation;

    return (
        <aside className="bg-[var(--bg-right)] border-l border-[var(--border)] p-6 flex flex-col items-center overflow-y-auto custom-scrollbar">
            {/* Profile */}
            <div className="flex flex-col items-center mt-4 mb-8 w-full">
                <div className="relative mb-6">
                    <img
                        src={otherMember?.image || "https://i.pravatar.cc/150"}
                        alt={otherMember?.name}
                        className="w-32 h-32 rounded-[40px] object-cover shadow-xl"
                    />
                    <div
                        className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-[var(--bg-right)] ${otherMember?.online ? "bg-[var(--status-online)]" : "bg-[var(--status-offline)]"}`}
                    ></div>
                </div>

                <h2 className="text-xl font-bold font-outfit text-[var(--text-primary)] mb-1 tracking-tight">{otherMember?.name}</h2>
                <p className="text-[var(--text-muted)] text-sm font-medium">{otherMember?.online ? "Active Now" : "Inactive"}</p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3 w-full mb-10">
                <Button variant="outline" className="flex flex-col h-auto py-4 rounded-2xl gap-2 border-[var(--border)] bg-[var(--input)] hover:bg-[var(--border)] transition-all">
                    <Icons.Phone size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Audio</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-4 rounded-2xl gap-2 border-[var(--border)] bg-[var(--input)] hover:bg-[var(--border)] transition-all">
                    <Icons.Video size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">Video</span>
                </Button>
                <Button variant="outline" className="flex flex-col h-auto py-4 rounded-2xl gap-2 border-[var(--border)] bg-[var(--input)] hover:bg-[var(--border)] transition-all">
                    <Icons.Dots size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">More</span>
                </Button>
            </div>

            {/* Media Section */}
            <div className="w-full">
                <div className="flex justify-between items-center mb-5 px-1">
                    <h3 className="text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] font-bold">
                        Media & Files
                    </h3>
                    <button className="text-[11px] text-[var(--accent)] hover:underline font-bold transition-all">
                        View All
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map((i) => (
                        <div
                            key={i}
                            className="aspect-[1.1] bg-[var(--input)] border border-[var(--border)] rounded-2xl cursor-pointer hover:bg-[var(--border)] transition-all"
                        />
                    ))}
                </div>
            </div>
        </aside>
    );
};

export default RightSidebar;
