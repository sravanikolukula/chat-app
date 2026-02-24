import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        image: v.string(),
        online: v.boolean(),
        lastSeen: v.optional(v.number()),
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        members: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
        typing: v.optional(v.array(v.id("users"))),
    }),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        body: v.string(),
        createdAt: v.number(),
        readBy: v.array(v.id("users")),
        deleted: v.optional(v.boolean()),
        reactions: v.optional(v.array(v.object({
            userId: v.id("users"),
            emoji: v.string(),
        }))),
    }).index("by_conversationId", ["conversationId"]),
});
