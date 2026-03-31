import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getDb } from "./db";
import { criteria, domains, evidences, indicators } from "../drizzle/schema";
import { eq, asc } from "drizzle-orm";
import { z } from "zod";
import { storagePut, storageGet } from "./storage";
import type { Evidence } from "../drizzle/schema";

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

  // المجالات
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

  // المعايير
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
  }),

  // المؤشرات
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

  // الشواهد
  evidences: router({
    byIndicator: publicProcedure
      .input(z.object({ indicatorId: z.number() }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) return [];
        const rows = await db.select().from(evidences)
          .where(eq(evidences.indicatorId, input.indicatorId))
          .orderBy(asc(evidences.createdAt));
        const withUrls = await Promise.all(rows.map(async (ev: Evidence) => {
          try {
            const { url } = await storageGet(ev.fileKey);
            return { ...ev, downloadUrl: url };
          } catch {
            return { ...ev, downloadUrl: null };
          }
        }));
        return withUrls;
      }),

    upload: publicProcedure
      .input(z.object({
        indicatorId: z.number(),
        fileName: z.string(),
        fileType: z.string(),
        fileSize: z.number(),
        title: z.string(),
        description: z.string().optional(),
        uploadedBy: z.string().optional(),
        fileData: z.string(), // base64
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const ext = input.fileName.split('.').pop() || 'bin';
        const key = `evidences/${input.indicatorId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
        const buffer = Buffer.from(input.fileData, 'base64');
        await storagePut(key, buffer, input.fileType);
        const [inserted] = await db.insert(evidences).values({
          indicatorId: input.indicatorId,
          title: input.title,
          description: input.description || '',
          fileKey: key,
          fileName: input.fileName,
          fileType: input.fileType,
          fileSize: input.fileSize,
          uploadedBy: input.uploadedBy || 'مجهول',
        }).$returningId();
        return { id: inserted.id, key };
      }),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        // Get file key before deleting
        const [ev] = await db.select().from(evidences).where(eq(evidences.id, input.id));
        await db.delete(evidences).where(eq(evidences.id, input.id));
        // Note: S3 file deletion not supported in current storage helper
        // The DB record is deleted; S3 file will remain until manual cleanup
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
