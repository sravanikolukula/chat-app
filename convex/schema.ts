import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        clerkId: v.string(),
        name: v.string(),
        image: v.string(),
        online: v.boolean(),
    }).index("by_clerkId", ["clerkId"]),

    conversations: defineTable({
        members: v.array(v.id("users")),
        isGroup: v.boolean(),
        groupName: v.optional(v.string()),
    }),

    messages: defineTable({
        conversationId: v.id("conversations"),
        senderId: v.id("users"),
        body: v.string(),
        createdAt: v.number(),
        readBy: v.array(v.id("users")),
        deleted: v.optional(v.boolean()),
    }).index("by_conversationId", ["conversationId"]),
});
