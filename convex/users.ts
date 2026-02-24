import { v } from "convex/values";
import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";

export const syncUser = mutation({
    args: {
        clerkId: v.string(),
        name: v.string(),
        image: v.string(),
    },
    handler: async (ctx: MutationCtx, args) => {
        // 1. Check if user already exists
        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
            .unique();

        // 2. If user exists, do nothing and return their ID
        if (user !== null) return user._id;

        // 3. Otherwise, create a new user record
        return await ctx.db.insert("users", {
            clerkId: args.clerkId,
            name: args.name,
            image: args.image,
            online: true,
            lastSeen: Date.now(),
        });
    },
});

export const updateStatus = mutation({
    args: { online: v.boolean() },
    handler: async (ctx: MutationCtx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (user) {
            await ctx.db.patch(user._id, {
                online: args.online,
                lastSeen: Date.now(),
            });
        }
    },
});

export const currentUser = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return null;
        }

        return await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();
    },
});

export const list = query({

    args: {
        searchTerm: v.optional(v.string()),
    },
    handler: async (ctx: QueryCtx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            console.log("No identity found in Convex query");
            return [];
        }

        const users = await ctx.db
            .query("users")
            .collect();

        const now = Date.now();
        const ONLINE_THRESHOLD = 60000; // 60 seconds

        const filteredUsers = users
            .filter((user) => user.clerkId !== identity.subject)
            .map((user) => ({
                ...user,
                online: user.online && (user.lastSeen ? (now - user.lastSeen < ONLINE_THRESHOLD) : false)
            }));

        if (args.searchTerm) {
            return filteredUsers.filter((user) =>
                user.name.toLowerCase().includes(args.searchTerm!.toLowerCase())
            );
        }
        return filteredUsers;
    },
});

// Debug query to see if ANY users exist (independent of auth)
export const debugAllUsers = query({
    args: {},
    handler: async (ctx: QueryCtx) => {
        return await ctx.db.query("users").collect();
    },
});
