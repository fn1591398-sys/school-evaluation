import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { deleteSharedEvidence, listSharedEvidences, uploadSharedEvidence } from "./supabaseEvidenceStorage";
import { getSharedCriteria, getSharedDomain, getSharedIndicator, listSharedCriteria, listSharedDomains, listSharedIndicators } from "./supabaseSchoolData";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const options = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...options, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  domains: router({
    list: publicProcedure.query(() => listSharedDomains()),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getSharedDomain(input.id)),
  }),
  criteria: router({
    byDomain: publicProcedure.input(z.object({ domainId: z.number() })).query(({ input }) => listSharedCriteria(input.domainId)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getSharedCriteria(input.id)),
  }),
  indicators: router({
    byCriteria: publicProcedure.input(z.object({ criteriaId: z.number() })).query(({ input }) => listSharedIndicators(input.criteriaId)),
    getById: publicProcedure.input(z.object({ id: z.number() })).query(({ input }) => getSharedIndicator(input.id)),
  }),
  evidences: router({
    byIndicator: publicProcedure.input(z.object({ indicatorId: z.number() })).query(({ input }) => listSharedEvidences(input.indicatorId)),
    upload: publicProcedure.input(z.object({ indicatorId: z.number(), fileName: z.string(), fileType: z.string(), fileSize: z.number(), title: z.string(), description: z.string().optional(), uploadedBy: z.string().optional(), fileData: z.string() })).mutation(async ({ input }) => uploadSharedEvidence({ indicatorId: input.indicatorId, title: input.title, description: input.description || "", fileName: input.fileName, fileType: input.fileType, fileSize: input.fileSize, uploadedBy: input.uploadedBy || "مجهول", buffer: Buffer.from(input.fileData, "base64") })),
    delete: publicProcedure.input(z.object({ id: z.number() })).mutation(({ input }) => deleteSharedEvidence(input.id)),
  }),
});

export type AppRouter = typeof appRouter;
