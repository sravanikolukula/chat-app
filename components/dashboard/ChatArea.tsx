"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "./Icons";
import { Conversation, Message } from "./types";
import { Button } from "../ui/button";

interface ChatAreaProps {
    selectedConversation: Conversation | null;
    onBack?: () => void;
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

const ChatArea = ({ selectedConversation, onBack }: ChatAreaProps) => {
    const [messageBody, setMessageBody] = useState("");
    const messages = useQuery(api.messages.list, selectedConversation ? { conversationId: selectedConversation._id } : "skip");
    const sendMessage = useMutation(api.messages.send);
    const setTyping = useMutation(api.conversations.setTyping);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                setTyping({ conversationId: selectedConversation._id, isTyping: false });
            }
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
            <main className="flex-1 bg-[var(--bg-chat)] md:flex flex-col items-center justify-center gap-6 p-8 overflow-hidden hidden h-full">
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
        <main className="flex-1 bg-[var(--bg-chat)] flex flex-col h-full relative overflow-hidden rounded-r-md w-full md:w-auto">
            {/* Header */}
            <header className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--glass-bg)] backdrop-blur-md z-10 shrink-0">
                <div className="flex items-center gap-4">
                    {/* Back Button for Mobile */}
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 hover:bg-[var(--input)] rounded-full transition-colors text-[var(--text-primary)]"
                    >
                        <Icons.Back size={24} />
                    </button>

                    <div className="relative">
                        <img
                            src={otherMember?.image || "https://i.pravatar.cc/150"}
                            alt={otherMember?.name}
                            className="w-10 h-10 rounded-full object-cover bg-[var(--border)]"
                        />
                        {/* <div className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 border-[var(--bg-sidebar)] ${user.online ? "bg-[var(--status-online)]" : "bg-[var(--status-offline)]"}`}></div> */}
                        {/* <div className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 ${otherMember?.online ? "bg-[hsl(var(--status-online))] border-gray-200" : "bg-transparent border-[var(--border)]"}`}></div> */}
                        <div
                            className={`absolute bottom-[-2px] right-[-2px] w-3 h-3 rounded-full border-2 transition-all
    ${otherMember?.online
                                    ? "bg-[hsl(var(--status-online))] border-background"
                                    : "bg-transparent border-border border-gray-950 dark:border-gray-300"
                                }
  `}
                        ></div>
                    </div>
                    <div>
                        <div className="font-semibold text-sm text-[var(--text-primary)]">{otherMember?.name}</div>
                        <div
                            className={`text-[11px] font-medium ${otherMember?.online
                                ? "text-[hsl(var(--status-online))]"
                                : "text-[hsl(var(--status-offline))]"
                                }`}
                        >
                            {otherMember?.online ? "Online" : "Offline"}
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
                {messages === undefined ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-muted)] animate-pulse">
                        <Icons.Dots size={24} className="mb-2" />
                        <span className="text-xs font-medium">Loading messages...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-12">
                        <div className="w-16 h-16 rounded-2xl bg-[var(--input)] flex items-center justify-center mb-6 text-3xl shadow-sm">
                            👋
                        </div>
                        <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
                            Say hello to {otherMember?.name}!
                        </h3>
                        <p className="text-sm text-[var(--text-muted)] max-w-[240px] leading-relaxed">
                            Every great friendship starts with a single message. Why not send one now?
                        </p>
                    </div>
                ) : (
                    messages.map((msg: Message) => {
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
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {otherMember?._id && selectedConversation?.typing?.includes(otherMember._id) && (
                <div className="px-8 py-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center gap-2 text-[11px] text-[var(--text-muted)] font-medium bg-[var(--input)]/50 dark:bg-zinc-800/50 w-fit px-3 py-1.5 rounded-full border border-[var(--border)]/20 shadow-sm">
                        typing
                        <div className="flex gap-1.5 ml-1">
                            <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-dot-slide"></span>
                            <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-dot-slide [animation-delay:-0.5s]"></span>
                            <span className="w-1 h-1 rounded-full bg-[var(--accent)] animate-dot-slide [animation-delay:-0.10s]"></span>
                        </div>

                    </div>
                    {/* <div className="flex items-center text-sm text-muted-foreground">
                        is typing
                        <div className="flex gap-1.5 ml-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] animate-zigzag"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] animate-zigzag [animation-delay:0.15s]"></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent))] animate-zigzag [animation-delay:0.3s]"></span>
                        </div>
                    </div> */}
                </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-[var(--bg-chat)] shrink-0 flex justify-center">
                <form
                    onSubmit={handleSendMessage}
                    className="w-full max-w-[800px] relative flex items-center group"
                >
                    <div className="flex-1 relative flex items-center">
                        {/* File Attachment Button */}
                        <button
                            type="button"
                            className="absolute left-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-xl hover:bg-[var(--border)]/30 z-10"
                        >
                            <Icons.Paperclip size={20} />
                        </button>

                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full pl-14 pr-14 py-4 rounded-[24px] border border-[var(--border)] bg-[var(--input)] text-[var(--text-primary)] outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/5 transition-all duration-300 shadow-sm placeholder:text-[var(--text-muted)]/60"
                            value={messageBody}
                            onChange={(e) => {
                                setMessageBody(e.target.value);
                                if (!selectedConversation) return;

                                // Send typing start
                                setTyping({ conversationId: selectedConversation._id, isTyping: true });

                                // Reset timeout
                                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                                typingTimeoutRef.current = setTimeout(() => {
                                    setTyping({ conversationId: selectedConversation._id, isTyping: false });
                                }, 2000);
                            }}
                        />

                        {/* Integrated Send Button */}
                        <button
                            type="submit"
                            className="absolute right-2 p-2.5 bg-indigo-900 text-white rounded-[16px] hover:bg-indigo-700 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:bg-indigo-600 disabled:active:scale-100 shadow-md shadow-indigo-500/20 z-10"
                            disabled={!messageBody.trim()}
                        >
                            <Icons.Send size={18} className="translate-x-[1px]" />
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default ChatArea;