import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

/**
 * Finance app schema
 * Each user has a list of owned private assets, ie. stocks USD, stock PLN, bonds, etc.
 * Each user can add and define their own private assets - name and maybe description
 * User can add a record of a wealth change - price of each asset at a given time - ie. once a month
 * User can add new assets later - ie. adding a new investing type - ie. crypto, etc.
 */

export default defineSchema({
  user: defineTable({
    id: v.string(),
    name: v.string(),
    email: v.string(),
    image: v.string(),
  }),

  asset: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    userId: v.string(),
  }),

  assetRecord: defineTable({
    assetId: v.string(),
    value: v.number(),
    date: v.number(),
    userId: v.string(),
  }),
});
