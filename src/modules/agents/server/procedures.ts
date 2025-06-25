import { db } from "@/db";
import { agents } from "@/db/schema";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { agentsInsertSchema } from "../schema";
import { z } from "zod";
import { eq, getTableColumns, sql } from "drizzle-orm";


export const agentsRouter = createTRPCRouter({
  //TODO: make getOne to use protectedProcedure (used for updating)
  getOne: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {

      const [existingAgent] = await db
        .select({
          //TODO:Replace with your actual data
          meetingsCount: sql<number>`5`,
          ...getTableColumns(agents)
        })
        .from(agents)
        .where(eq(agents.id, input.id))

      return existingAgent;
      
    }),
  //TODO: make getMany to use protectedProcedure
  getMany: protectedProcedure.query(async () => {
    const data = await db
      .select()
      .from(agents)

    return data;
  }),
  create: protectedProcedure
    .input(agentsInsertSchema)
    .mutation(async ({ input, ctx }) => {
      //you can destruct the name, instruction from the input
      // and session from the ctx
      //how are we getting this ? well we feeded the context in the protectedProcedure
      const [createdAgent] = await db
        .insert(agents)
        .values({
          ...input,
          userId: ctx.auth.user.id
        })
        .returning();

      return createdAgent;
    })
})