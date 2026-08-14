import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { criteria, domains, indicators } from "../drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { deleteSharedEvidence, listSharedEvidences, uploadSharedEvidence } from "./supabaseEvidenceStorage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  domains: router({
    list: publicProcedure.query(async () => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(domains).orderBy(asc(domains.orderIndex));
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [domain] = await db.select().from(domains).where(eq(domains.id, input.id));
        return domain ?? null;
      }),
  }),

  criteria: router({
    byDomain: publicProcedure
      .input(z.object({ domainId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(criteria)
          .where(eq(criteria.domainId, input.domainId))
          .orderBy(asc(criteria.orderIndex));
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [criterion] = await db.select().from(criteria).where(eq(criteria.id, input.id));
        return criterion ?? null;
      }),
  }),

  indicators: router({
    byCriteria: publicProcedure
      .input(z.object({ criteriaId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        return db.select().from(indicators)
          .where(eq(indicators.criteriaId, input.criteriaId))
          .orderBy(asc(indicators.orderIndex));
      }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return null;
        const [indicator] = await db.select().from(indicators).where(eq(indicators.id, input.id));
        return indicator ?? null;
      }),
  }),

  evidences: router({
    byIndicator: publicProcedure
      .input(z.object({ indicatorId: z.number() }))
      .query(async ({ input }) => listSharedEvidences(input.indicatorId)),
    upload: publicProcedure
      .input(z.object({
        indicatorId: z.number(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        title: z.string(),
        description: z.string().optional(),
        uploadedBy: z.string().optional(),
        fileData: z.string(),
      }))
      .mutation(async ({ input }) => uploadSharedEvidence({
        indicatorId: input.indicatorId,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        title: input.title,
        description: input.description || "",
        uploadedBy: input.uploadedBy || "مجهول",
        buffer: Buffer.from(input.fileData, "base64"),
      })),
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => deleteSharedEvidence(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
