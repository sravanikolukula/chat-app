import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";

export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        body: v.string(),
    },
    handler: async (ctx: MutationCtx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Unauthorized");
        }

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) {
            throw new Error("User not found");
        }

        return await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            body: args.body,
            createdAt: Date.now(),
            readBy: [user._id],
        });
    },
});

export const list = query({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx: QueryCtx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        return await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();
    },
});

export const markRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
        if (!user) return;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversationId", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        const unreadMessages = messages.filter(m => !m.readBy.includes(user._id));

        for (const message of unreadMessages) {
            await ctx.db.patch(message._id, {
                readBy: [...message.readBy, user._id]
            });
        }
    },
});
