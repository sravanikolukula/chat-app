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

        const results = await Promise.all(
            myConversations.map(async (conv) => {
                const otherMemberId = conv.members.find((id) => id !== user._id);
                const otherMember = await ctx.db.get(otherMemberId!);

                const lastMessage = await ctx.db
                    .query("messages")
                    .withIndex("by_conversationId", (q) => q.eq("conversationId", conv._id))
                    .order("desc")
                    .first();

                return {
                    ...conv,
                    otherMember,
                    lastMessage,
                };
            })
        );

        return results;
    },
});
