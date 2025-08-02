import { v } from "convex/values";
import { paginationOptsValidator } from "convex/server";

import map from "lodash/map";
import reduce from "lodash/reduce";
import sortBy from "lodash/sortBy";
import sum from "lodash/sum";

import { mutation, query } from "./_generated/server";

export const addAssetsRecords = mutation({
  args: {
    values: v.array(
      v.object({
        value: v.number(),
        date: v.number(),
        assetId: v.id("asset"),
        userId: v.string(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const newRecords = args.values;

    const newIds = await Promise.all(
      newRecords.map(async (value) => {
        const assetName = await ctx.db.get(value.assetId);
        return ctx.db.insert("assetRecord", {
          value: value.value,
          assetId: value.assetId,
          assetName: assetName!.name,
          // date: value.date,
          // userId: value.userId,
        });
      }),
    );

    await ctx.db.insert("assetUserRecord", {
      date: newRecords[0]!.date,
      assetRecords: newIds,
      userId: newRecords[0]!.userId,
    });
  },
});

export const getAssetRecords = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const userRecords = await ctx.db
      .query("assetUserRecord")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .collect();

    const groupedRecords = await reduce(
      userRecords,
      async (accPromise, record) => {
        const acc = await accPromise;
        acc[record.date] = acc[record.date] ?? {
          value: 0,
          date: record.date,
          assetRecords: [],
        };

        const assetValues = await Promise.all(
          record.assetRecords.map(async (ar) => {
            const assetRecord = await ctx.db.get(ar);
            return {
              value: assetRecord!.value,
              assetName: assetRecord!.assetName,
            };
          }),
        );

        acc[record.date]!.value += sum(map(assetValues, (a) => a?.value));
        acc[record.date]!.assetRecords = assetValues;
        return acc;
      },
      Promise.resolve(
        {} as Record<
          number,
          {
            value: number;
            date: number;
            assetRecords: { value: number; assetName: string }[];
          }
        >,
      ),
    );

    const sortedRecords = sortBy(groupedRecords, (a) => a.date);
    return sortedRecords;
  },
});

export const getAssetHistory = query({
  args: {
    paginationOpts: paginationOptsValidator,
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const records = await ctx.db
      .query("assetUserRecord")
      .withIndex("by_date")
      .filter((q) => q.eq(q.field("userId"), args.userId))
      .order("desc")
      .paginate(args.paginationOpts);

    const assetValues = await Promise.all(
      records.page.map(async (record) => {
        const assetRecords = await Promise.all(
          record.assetRecords.map(async (ar) => {
            const assetRecord = await ctx.db.get(ar);
            return assetRecord!;
          }),
        );
        return { ...record, assetRecords };
      }),
    );

    return { ...records, page: assetValues };
  },
});

export const deleteAssetRecord = mutation({
  args: { ids: v.array(v.id("assetRecord")) },
  handler: async (ctx, args) => {
    for (const id of args.ids) {
      await ctx.db.delete(id);
    }
  },
});
