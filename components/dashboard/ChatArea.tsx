"use client";

import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Icons } from "./Icons";
import { Conversation, Message } from "./types";
import { Button } from "../ui/button";

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢"];

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
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [isAtBottom, setIsAtBottom] = useState(true);
    const messages = useQuery(api.messages.list, selectedConversation ? { conversationId: selectedConversation._id } : "skip");
    const currentUser = useQuery(api.users.currentUser);
    const sendMessage = useMutation(api.messages.send);
    const markRead = useMutation(api.messages.markRead);
    const toggleReaction = useMutation(api.messages.toggleReaction);
    const removeMessage = useMutation(api.messages.remove);
    const setTyping = useMutation(api.conversations.setTyping);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [lastAttemptedMessage, setLastAttemptedMessage] = useState<string>("");

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        setShowScrollButton(false);
    };

    // Mark as read when conversation opens or new messages arrive
    useEffect(() => {
        if (selectedConversation?._id) {
            markRead({ conversationId: selectedConversation._id });
        }
    }, [selectedConversation?._id, messages?.length, markRead]);

    // Handle scroll awareness
    // const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    //     const target = e.currentTarget;
    //     const offset = 100; // tolerance
    //     const isBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + offset;
    //     setIsAtBottom(isBottom);
    //     if (isBottom) setShowScrollButton(false);
    // };
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget;
        const offset = 80;

        const isBottom =
            target.scrollHeight - target.scrollTop <=
            target.clientHeight + offset;

        setIsAtBottom(isBottom);

        if (isBottom) {
            setShowScrollButton(false);
        }
    };
    // Smart auto-scroll
    // useEffect(() => {
    //     if (messages === undefined) return;

    //     if (isAtBottom) {
    //         scrollToBottom();
    //     } else {
    //         // Check if last message is from someone else
    //         const lastMessage = messages[messages.length - 1];
    //         if (lastMessage && lastMessage.senderId === otherMember?._id) {
    //             setShowScrollButton(true);
    //         }
    //     }
    // }, [messages?.length]);
    // Smart auto-scroll logic
    useEffect(() => {
        if (!messages || !scrollContainerRef.current) return;

        const container = scrollContainerRef.current;
        const offset = 100; // tolerance
        const isNearBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + offset;

        const lastMessage = messages[messages.length - 1];
        const isFromMe = lastMessage && lastMessage.senderId === currentUser?._id;

        // Auto-scroll if I sent the message OR if I'm already at the bottom
        if (isFromMe || isNearBottom) {
            scrollToBottom();
            setShowScrollButton(false);
        } else if (messages.length > 0) {
            // Only show the button if a new message arrived while we were scrolled up
            setShowScrollButton(true);
        }
    }, [messages?.length, currentUser?._id]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation?._id]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        const bodyToSend = messageBody.trim();
        if (!bodyToSend || !selectedConversation) return;

        setSendError(null);
        try {
            if (!window.navigator.onLine) {
                throw new Error("Offline");
            }
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
                setTyping({ conversationId: selectedConversation._id, isTyping: false });
            }
            await sendMessage({
                conversationId: selectedConversation._id,
                body: bodyToSend,
                messageType: "text",
            });
            setMessageBody("");
            // Immediate scroll for better UX
            setTimeout(scrollToBottom, 100);
        } catch (error: any) {
            console.error("Error sending message:", error);
            if (!window.navigator.onLine || error.message === "Offline") {
                setSendError("No internet connection. Please check your network and try again.");
            } else {
                setSendError("Message failed to send. Click to retry.");
            }
            setLastAttemptedMessage(bodyToSend);
        }
    };

    const handleRetry = () => {
        setMessageBody(lastAttemptedMessage);
        setSendError(null);
    };

    // const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    //     const file = e.target.files?.[0];
    //     if (!file || !selectedConversation) return;

    //     setIsUploading(true);
    //     try {
    //         const formData = new FormData();
    //         formData.append("file", file);
    //         formData.append("upload_preset", "ml_default"); // Default preset, usually needs to be configured

    //         const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "demo";
    //         console.log("Cloud name:", cloudName);
    //         const response = await fetch(
    //             `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    //             {
    //                 method: "POST",
    //                 body: formData,
    //             }
    //         );
    //         console.log("response", response);
    //         const data = await response.json();
    //         if (data.secure_url) {
    //             const isImage = file.type.startsWith("image/");
    //             await sendMessage({
    //                 conversationId: selectedConversation._id,
    //                 body: isImage ? "Sent an image" : `Sent a file: ${file.name}`,
    //                 messageType: isImage ? "image" : "file",
    //                 contentUrl: data.secure_url,
    //                 fileName: file.name,
    //                 fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
    //             });
    //         }
    //     } catch (error) {
    //         console.error("Error uploading file:", error);
    //     } finally {
    //         setIsUploading(false);
    //         if (fileInputRef.current) fileInputRef.current.value = "";
    //     }
    // };
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedConversation) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append("file", file);

            // Use env variable or fallback to ml_default
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";
            formData.append("upload_preset", uploadPreset);

            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

            if (!cloudName) {
                throw new Error("Cloudinary Cloud Name is not defined in environment variables.");
            }

            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            console.log("Cloudinary response:", data);

            if (!response.ok) {
                throw new Error(data.error?.message || "Upload failed");
            }

            if (data.secure_url) {
                const isImage = file.type.startsWith("image/");

                await sendMessage({
                    conversationId: selectedConversation._id,
                    body: isImage ? "Sent an image" : `Sent a file: ${file.name}`,
                    messageType: isImage ? "image" : "file",
                    contentUrl: data.secure_url,
                    fileName: file.name,
                    fileSize: (file.size / 1024 / 1024).toFixed(2) + " MB",
                });
                // Immediate scroll for better UX
                setTimeout(scrollToBottom, 100);
            }
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    if (!selectedConversation) {
        return (
            <main className="flex-1 bg-[var(--bg-chat)] md:flex flex-col items-center justify-center gap-6 p-8 overflow-hidden hidden h-full">
                <div className="w-20 h-20 rounded-3xl bg-[var(--input)] flex items-center justify-center text-3xl shadow-xl shadow-black/5 animate-in fade-in zoom-in duration-500">
                    ✨
                </div>
                <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                    <h2 className="text-4xl font-bold text-[var(--text-primary)] mb-2 tracking-tight">Welcome to ChitChat</h2>
                    <p className="text-[var(--text-muted)] text-sm">Select a contact from the sidebar to start a conversation</p>
                </div>
            </main>
        );
    }

    const otherMember = selectedConversation.otherMember;

    return (
        <main className="flex-1 bg-[var(--bg-chat)] flex flex-col h-full relative rounded-r-md w-full md:w-auto overflow-hidden">
            {/* Header */}
            <header className="px-6 py-4 border-b border-[var(--border)] flex justify-between items-center bg-[var(--glass-bg)] backdrop-blur-md z-10 shrink-0 h-16">
                <div className="flex items-center gap-4 ">
                    {/* Back Button for Mobile */}
                    <button
                        onClick={onBack}
                        className="md:hidden p-2 -ml-2 hover:bg-[var(--input)] rounded-full transition-colors text-[var(--text-primary)]"
                    >
                        <Icons.Back size={24} />
                    </button>

                    <div className="relative ">
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
                        <div className="font-semibold text-md text-[var(--text-primary)]">{otherMember?.name}</div>
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
            <div
                ref={scrollContainerRef}
                onScroll={handleScroll}
                className="flex-1 min-h-0 overflow-y-auto px-6 py-6 flex flex-col gap-6 custom-scrollbar relative"
            >
                {messages === undefined ? (
                    <div className="flex flex-col gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : "justify-start"} animate-pulse`}>
                                <div className="flex gap-2 max-w-[70%]">
                                    {i % 2 !== 0 && <div className="w-8 h-8 rounded-full bg-(--input) shrink-0 mt-auto" />}
                                    <div className={`h-12 w-48 bg-(--input) rounded-2xl ${i % 2 === 0 ? "rounded-br-none" : "rounded-bl-none"}`} />
                                </div>
                            </div>
                        ))}
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

                        // Group reactions by emoji
                        const reactionCounts = (msg.reactions || []).reduce((acc: any, curr) => {
                            acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                            return acc;
                        }, {});

                        const handleCopy = () => {
                            navigator.clipboard.writeText(msg.body);
                        };

                        return (
                            <div
                                key={msg._id}
                                className={`flex gap-3 max-w-[85%] items-end group/msg relative animate-in fade-in duration-300 ${isMe ? "self-end flex-row-reverse" : "self-start flex-row"}`}
                            >
                                <div className="shrink-0 mb-1">
                                    {isMe ? (
                                        <img
                                            src={currentUser?.image || "https://i.pravatar.cc/150"}
                                            alt=""
                                            className="w-7 h-7 rounded-full object-cover border border-white/20"
                                        />
                                    ) : (
                                        <img
                                            src={otherMember?.image || "https://i.pravatar.cc/150"}
                                            alt=""
                                            className="w-7 h-7 rounded-full object-cover bg-(--border)"
                                        />
                                    )}
                                </div>
                                <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"} relative`}>
                                    {/* Action Bar on Hover */}
                                    {!msg.deleted && (
                                        <div className={`absolute top-0 transform -translate-y-full opacity-0 group-hover/msg:opacity-100 transition-all duration-200 z-30 flex items-center bg-(--bg-sidebar) border border-(--border) rounded-lg shadow-xl px-1 py-1 gap-1 mb-1 ${isMe ? "right-0" : "left-0"}`}>
                                            <div className="flex items-center">
                                                {EMOJIS.map(emoji => (
                                                    <button
                                                        key={emoji}
                                                        onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                                                        className={`p-1 hover:bg-(--border) rounded transition-colors text-sm ${(msg.reactions || []).some(r => r.userId !== otherMember?._id && r.emoji === emoji) ? "bg-(--border)" : ""}`}
                                                    >
                                                        {emoji}
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="w-px h-4 bg-[var(--border)] mx-1" />
                                            <button
                                                onClick={handleCopy}
                                                className="p-1.5 hover:bg-[var(--border)] rounded transition-colors text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                                                title="Copy text"
                                            >
                                                <Icons.Copy size={13} />
                                            </button>
                                            {isMe && (
                                                <button
                                                    onClick={() => removeMessage({ messageId: msg._id })}
                                                    className="p-1.5 hover:bg-red-500/10 rounded transition-colors text-[var(--text-muted)] hover:text-red-500"
                                                    title="Delete message"
                                                >
                                                    <Icons.Trash size={13} />
                                                </button>
                                            )}
                                        </div>
                                    )}

                                    <div className={`${(msg.messageType === "text" || !msg.messageType || msg.deleted) ? "px-4 py-2.5" : "p-1"} rounded-2xl text-[13px] leading-relaxed shadow-sm transition-all ${msg.deleted ? "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 italic border border-zinc-200 dark:border-zinc-800" : isMe ? "bg-[var(--bubble-sent)] text-[var(--bubble-sent-text)] rounded-br-none" : "bg-[var(--bubble-received)] text-[var(--bubble-received-text)] rounded-bl-none"}`}>
                                        {msg.deleted ? (
                                            "This message was deleted"
                                        ) : msg.messageType === "image" ? (
                                            <div className="flex flex-col max-w-[320px]">
                                                <div className="relative rounded-xl overflow-hidden border border-black/5 dark:border-white/5 shadow-sm group/img-cont">
                                                    <img
                                                        src={msg.contentUrl}
                                                        alt="Sent image"
                                                        className="w-full h-auto max-h-[400px] object-cover cursor-pointer hover:scale-[1.02] transition-transform duration-300"
                                                        onClick={() => window.open(msg.contentUrl, "_blank")}
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover/img-cont:bg-black/5 transition-colors pointer-events-none" />
                                                </div>
                                                {msg.body && msg.body !== "Sent an image" && (
                                                    <span className="px-4 py-2 text-[13px] inline-block">{msg.body}</span>
                                                )}
                                            </div>
                                        ) : msg.messageType === "file" ? (
                                            <div className="flex flex-col min-w-[240px]">
                                                <div className={`flex items-center gap-3 ${isMe ? "bg-black/10 dark:bg-black/5" : "bg-black/20 dark:bg-white/5"} p-3 rounded-xl border ${isMe ? "border-white/10 dark:border-black/5" : "border-black/10 dark:border-white/10"} backdrop-blur-md shadow-lg transition-all hover:bg-opacity-80`}>
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${isMe ? "bg-[var(--bubble-sent-text)] text-[var(--bubble-sent)]" : "bg-(--accent) text-(--accent-foreground)"}`}>
                                                        <Icons.File size={20} strokeWidth={2.5} />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-bold text-[13px] truncate ${isMe ? "text-[var(--bubble-sent-text)]" : "text-(--text-primary)"}`}>{msg.fileName}</div>
                                                        <div className={`text-[10px] font-medium tracking-wide ${isMe ? "text-[var(--bubble-sent-text)] opacity-60" : "text-(--text-muted)"}`}>{msg.fileSize}</div>
                                                    </div>
                                                    <a
                                                        href={msg.contentUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        download={msg.fileName}
                                                        className={`p-2 rounded-lg transition-all ${isMe ? "hover:bg-black/10 text-[var(--bubble-sent-text)] opacity-80 hover:opacity-100" : "hover:bg-black/10 dark:hover:bg-white/10 text-(--text-muted) hover:text-(--text-primary)"}`}
                                                    >
                                                        <Icons.Download size={18} />
                                                    </a>
                                                </div>
                                                {msg.body && msg.body !== `Sent a file: ${msg.fileName}` && (
                                                    <span className={`px-4 py-2 font-medium ${isMe ? "text-[var(--bubble-sent-text)] opacity-95" : "text-(--text-primary)"}`}>{msg.body}</span>
                                                )}
                                            </div>
                                        ) : (
                                            msg.body
                                        )}
                                    </div>

                                    {/* Reaction Badges */}
                                    {Object.keys(reactionCounts).length > 0 && !msg.deleted && (
                                        <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? "justify-end" : "justify-start"}`}>
                                            {Object.entries(reactionCounts).map(([emoji, count]: [string, any]) => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                                                    className="flex items-center gap-1 bg-(--bg-sidebar) border border-(--border) rounded-full px-1.5 py-0.5 text-[10px] hover:bg-(--border) transition-colors"
                                                >
                                                    <span>{emoji}</span>
                                                    <span className="font-bold text-[var(--text-muted)]">{count}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="text-[9px] text-[var(--text-muted)] mt-0.5 flex items-center gap-1.5 uppercase font-medium tracking-wider">
                                        {formatMessageTime(msg.createdAt)}
                                        {isMe && !msg.deleted && <Icons.DoubleCheck size={12} className="text-[var(--status-online)]" />}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />

                {/* Scroll Button */}
                {/* {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[var(--accent)] text-[var(--accent-foreground)] px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 animate-bounce cursor-pointer z-20"
                    >
                        <Icons.Back size={14} className="rotate-270" />
                        New messages ↓
                    </button>
                )} */}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2
                            bg-[var(--accent)] text-[var(--accent-foreground)]
                            px-4 py-2 rounded-full text-xs font-semibold
                            shadow-xl shadow-black/10 backdrop-blur-md
                            animate-in fade-in slide-in-from-bottom-4
                            hover:scale-105 active:scale-95 transition-all duration-200 z-20"
                    >
                        ↓ New messages
                    </button>
                )}
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
                </div>
            )}
            {/* Send Error */}
            {sendError && (
                <div
                    onClick={handleRetry}
                    className="mx-6 mb-2 py-2 px-4 bg-red-500/10 border border-red-500/20 text-red-500 text-[11px] font-medium rounded-lg flex items-center justify-between cursor-pointer hover:bg-red-500/15 transition-all animate-in fade-in slide-in-from-bottom-2"
                >
                    <div className="flex items-center gap-2">
                        <Icons.Dots className="w-3 h-3" />
                        {sendError}
                    </div>
                    <span className="underline uppercase tracking-wider text-[9px]">Retry</span>
                </div>
            )}

            {/* Input Area */}
            <div className="p-6 bg-(--bg-chat) shrink-0 flex justify-center">
                <form
                    onSubmit={handleSendMessage}
                    className="w-full max-w-[800px] relative flex items-center group"
                >
                    <div className="flex-1 relative flex items-center">
                        {/* File Attachment Button */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isUploading}
                            className={`absolute left-4 p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors rounded-xl hover:bg-[var(--border)]/30 z-10 ${isUploading ? "animate-pulse" : ""}`}
                        >
                            {isUploading ? <Icons.Dots size={20} /> : <Icons.Paperclip size={20} />}
                        </button>

                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                            accept="image/*,.pdf,.doc,.docx,.txt"
                        />

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
                            className="absolute right-2 p-2.5 bg-indigo-700 text-white rounded-[16px] hover:bg-indigo-700 active:scale-95 transition-all duration-200 disabled:opacity-30 disabled:hover:bg-indigo-600 disabled:active:scale-100 shadow-md shadow-indigo-500/20 z-10"
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