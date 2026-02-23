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
        });
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
