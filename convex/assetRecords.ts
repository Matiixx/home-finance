import { reduce, sortBy } from "lodash";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addAssetRecord = mutation({
  args: {
    value: v.number(),
    date: v.number(),
    assetId: v.string(),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("assetRecord", {
      value: args.value,
      date: args.date,
      assetId: args.assetId,
      userId: args.userId,
    });
  },
});

export const addAssetsRecords = mutation({
  args: {
    values: v.array(
      v.object({
        value: v.number(),
        date: v.number(),
        assetId: v.string(),
        userId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const newRecords = args.values;

    for (const value of newRecords) {
      await ctx.db.insert("assetRecord", {
        value: value.value,
        date: value.date,
        assetId: value.assetId,
        userId: value.userId,
      });
    }
  },
});

export const getAssetRecords = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userRecords = await ctx.db
      .query("assetRecord")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();
    const groupedRecords = reduce(
      userRecords,
      (acc, record) => {
        acc[record.date] = acc[record.date] ?? { value: 0, date: record.date };
        acc[record.date]!.value += record.value;
        return acc;
      },
      {} as Record<number, { value: number; date: number }>,
    );
    const sortedRecords = sortBy(groupedRecords, (a) => -a.date);
    return sortedRecords;
  },
});
