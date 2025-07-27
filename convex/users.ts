import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    id: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists by Discord ID
    const existingUser = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("id"), args.id))
      .first();

    if (existingUser) {
      // Update user info in case it changed
      await ctx.db.patch(existingUser._id, {
        name: args.name,
        email: args.email,
        image: args.image,
      });
      return existingUser._id;
    }

    // Create new user
    const userId = await ctx.db.insert("user", {
      id: args.id,
      name: args.name,
      email: args.email,
      image: args.image,
    });

    return userId;
  },
});

export const getUserByNextAuthId = query({
  args: { nextAuthId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("id"), args.nextAuthId))
      .first();
  },
});
