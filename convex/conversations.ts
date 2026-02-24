import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";

export const getOrCreate = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx: MutationCtx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) {
            throw new Error("User not found");
        }

        // Check if conversation already exists
        const existingConversation = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.and(
                    q.eq(q.field("isGroup"), false),
                    q.or(
                        q.eq(q.field("members"), [currentUser._id, args.userId]),
                        q.eq(q.field("members"), [args.userId, currentUser._id])
                    )
                )
            )
            .unique();

        if (existingConversation) {
            return existingConversation._id;
        }

        // Create new conversation
        return await ctx.db.insert("conversations", {
            members: [currentUser._id, args.userId],
            isGroup: false,
        });
    },
});

export const list = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            return [];
        }

        const conversations = await ctx.db
            .query("conversations")
            .collect();

        const myConversations = conversations.filter((conv) =>
            conv.members.includes(user._id)
        );

        const now = Date.now();
        const ONLINE_THRESHOLD = 60000; // 60 seconds

        const results = await Promise.all(
            myConversations.map(async (conv) => {
                const otherMemberId = conv.members.find((id) => id !== user._id);
                const otherMember = await ctx.db.get(otherMemberId!);

                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
                    .order("desc")
                    .first();

                const allMessages = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
                    .collect();

                const unreadCount = allMessages.filter(
                    (m) => !m.readBy.includes(user._id)
                ).length;

                return {
                    ...conv,
                    otherMember: otherMember ? {
                        ...otherMember,
                        online: otherMember.online && (otherMember.lastSeen ? (now - otherMember.lastSeen < ONLINE_THRESHOLD) : false)
                    } : null,
                    lastMessage,
                    unreadCount,
                };
            })
        );

        return results;
    },
});

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        let typing = conversation.typing || [];
        if (args.isTyping) {
            if (!typing.includes(user._id)) {
                typing.push(user._id);
            }
        } else {
            typing = typing.filter((id) => id !== user._id);
        }

        await ctx.db.patch(args.conversationId, { typing });
    },
});
