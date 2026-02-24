"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "./Icons";
import { Conversation, Message } from "./types";
import { Button } from "../ui/button";

interface ChatAreaProps {
    selectedConversation: Conversation | null;
}

const formatMessageTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();

    const isToday = date.toDateString() === now.toDateString();
    const isSameYear = date.getFullYear() === now.getFullYear();

    const timeOptions: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };
    const timeStr = date.toLocaleTimeString([], timeOptions);

    if (isToday) {
        return timeStr;
    }

    if (isSameYear) {
        return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${timeStr}`;
    }

    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${timeStr}`;
};

const ChatArea = ({ selectedConversation }: ChatAreaProps) => {
    const [messageBody, setMessageBody] = useState("");
    const messages = useQuery(api.messages.list, selectedConversation ? { conversationId: selectedConversation._id } : "skip");
    const sendMessage = useMutation(api.messages.send);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageBody.trim() || !selectedConversation) return;

        try {
            await sendMessage({
                conversationId: selectedConversation._id,
                body: messageBody,
            });
            setMessageBody("");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (!selectedConversation) {
        return (
            <main className="flex-1 bg-[var(--bg-chat)] flex flex-col items-center justify-center gap-6 p-8 overflow-hidden">
                <div className="w-20 h-20 rounded-3xl bg-[var(--input)] flex items-center justify-center text-3xl shadow-xl shadow-black/5 animate-in fade-in zoom-in duration-500">
                    ✨
                </div>
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Welcome to ChitChat</h2>
                    <p className="text-[var(--text-muted)] text-sm">Select a contact from the sidebar to start a conversation</p>
                </div>
            </main>
        );
    }

    const otherMember = selectedConversation.otherMember;

    return (
        <main className="flex-1 bg-[var(--bg-chat)] flex flex-col h-full relative overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--glass-bg)] backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <img
                            src={otherMember?.image || "https://i.pravatar.cc/150"}
                            alt={otherMember?.name}
                            className="w-10 h-10 rounded-full object-cover bg-[var(--border)]"
                        />
                        <div className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 border-[var(--bg-chat)] ${otherMember?.online ? "bg-[var(--status-online)]" : "bg-[var(--status-offline)]"}`}></div>
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">{otherMember?.name}</div>
                        <div className="text-[11px] text-[var(--status-online)] font-medium">
                            {otherMember?.online ? "Online" : "Away"}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" size="icon" className="w-9 h-9 border border-[var(--border)] bg-[var(--input)] hover:bg-[var(--border)] transition-colors"><Icons.Phone size={18} /></Button>
                    <Button variant="ghost" size="icon" className="w-9 h-9 border border-[var(--border)] bg-[var(--input)] hover:bg-[var(--border)] transition-colors"><Icons.Video size={18} /></Button>
                    <Button variant="ghost" size="icon" className="w-9 h-9 border border-[var(--border)] bg-[var(--input)] hover:bg-[var(--border)] transition-colors"><Icons.Dots size={18} /></Button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-6 custom-scrollbar">
                {messages?.map((msg: Message) => {
                    const isMe = msg.senderId !== otherMember?._id;
                    return (
                        <div
                            key={msg._id}
                            className={`flex gap-3 max-w-[85%] items-end animate-in fade-in duration-300 ${isMe ? "self-end flex-row-reverse" : "self-start flex-row"}`}
                        >
                            <div className="shrink-0 mb-1">
                                {isMe ? (
                                    <div className="w-7 h-7 rounded-full bg-zinc-300 flex items-center justify-center text-[10px] font-bold text-black border border-white/20">ME</div>
                                ) : (
                                    <img
                                        src={otherMember?.image || "https://i.pravatar.cc/150"}
                                        alt=""
                                        className="w-7 h-7 rounded-full object-cover bg-[var(--border)]"
                                    />
                                )}
                            </div>
                            <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${isMe ? "bg-[var(--bubble-sent)] text-[var(--bubble-sent-text)] rounded-br-none" : "bg-[var(--bubble-received)] text-[var(--bubble-received-text)] rounded-bl-none"}`}>
                                    {msg.body}
                                </div>
                                <div className="text-[9px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5 uppercase font-medium tracking-wider">
                                    {formatMessageTime(msg.createdAt)}
                                    {isMe && <Icons.DoubleCheck size={12} className="text-[var(--status-online)]" />}
                                </div>
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-6 bg-[var(--bg-chat)] flex gap-3 shrink-0">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        className="w-full px-5 py-3.5 rounded-2xl border border-[var(--border)] bg-[var(--input)] color-[var(--text-primary)] outline-none focus:border-[var(--accent)] transition-all duration-200"
                        value={messageBody}
                        onChange={(e) => setMessageBody(e.target.value)}
                    />
                </div>
                <button
                    type="submit"
                    className="bg-[var(--accent)] text-[var(--accent-foreground)] px-6 rounded-full font-bold text-sm flex items-center gap-2 hover:translate-y-[-2px] active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0"
                    disabled={!messageBody.trim()}
                >

                    <Icons.Send size={18} />
                </button>
            </form>
        </main>
    );
};

export default ChatArea;