import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getUserAssets = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log("🚀 ~ getUserAssets ~ args:", args);

    return ctx.db
      .query("asset")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
  },
});

export const addAsset = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("asset", {
      name: args.name,
      description: args.description,
      userId: args.userId,
    });
  },
});

export const updateAsset = mutation({
  args: {
    id: v.id("asset"),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
    });
  },
});
