import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  createPortfolioFile,
  ensurePortfolioSeeded,
  getPortfolioSettings,
  listPortfolioFiles,
  listPortfolioProjects,
  updatePortfolioProject,
  updatePortfolioSettings,
} from "./db";
import { storageCreateUpload } from "./storage";

const projectPatch = z.object({
  id: z.number().int().positive(),
  title: z.string().min(1).max(255).optional(),
  category: z.string().nullable().optional(),
  context: z.string().nullable().optional(),
  objective: z.string().nullable().optional(),
  audience: z.string().nullable().optional(),
  role: z.string().nullable().optional(),
  tools: z.string().nullable().optional(),
  aiContribution: z.string().nullable().optional(),
  editingDecisions: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
  videoUrl: z.string().nullable().optional(),
  posterUrl: z.string().nullable().optional(),
  aspectRatio: z.string().nullable().optional(),
  duration: z.string().nullable().optional(),
  captionUrl: z.string().nullable().optional(),
  transcript: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
  workType: z.string().nullable().optional(),
});

const uploadKind = z.enum(["video", "poster", "caption", "cv"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  portfolio: router({
    publicData: publicProcedure.query(async () => {
      await ensurePortfolioSeeded();
      const [projects, settings] = await Promise.all([listPortfolioProjects(), getPortfolioSettings()]);
      return { projects, settings };
    }),
    adminData: adminProcedure.query(async () => {
      await ensurePortfolioSeeded();
      const [projects, settings, files] = await Promise.all([listPortfolioProjects(), getPortfolioSettings(), listPortfolioFiles()]);
      return { projects, settings, files };
    }),
    updateProject: adminProcedure.input(projectPatch).mutation(async ({ input }) => {
      const { id, featured, ...patch } = input;
      return updatePortfolioProject(id, {
        ...patch,
        ...(featured === undefined ? {} : { featured: featured ? 1 : 0 }),
      });
    }),
    updateSettings: adminProcedure.input(z.object({ cvUrl: z.string().nullable() })).mutation(({ input }) => updatePortfolioSettings(input.cvUrl)),
    requestUpload: adminProcedure.input(z.object({
      kind: uploadKind,
      fileName: z.string().min(1).max(255),
      mimeType: z.string().min(1).max(160),
      sizeBytes: z.number().int().positive().max(2_000_000_000),
    })).mutation(async ({ ctx, input }) => {
      const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, "-");
      return storageCreateUpload(`${ctx.user.id}/portfolio/${input.kind}/${safeName}`);
    }),
    completeUpload: adminProcedure.input(z.object({
      projectId: z.number().int().positive().nullable().optional(),
      kind: uploadKind,
      originalName: z.string().min(1).max(255),
      mimeType: z.string().min(1).max(160),
      sizeBytes: z.number().int().positive().max(2_000_000_000),
      storageKey: z.string().min(1),
      storageUrl: z.string().min(1),
    })).mutation(async ({ ctx, input }) => {
      const expectedPrefix = `${ctx.user.id}/portfolio/`;
      if (!input.storageKey.startsWith(expectedPrefix)) throw new Error("Invalid storage key");
      return createPortfolioFile({ ...input, createdBy: ctx.user.id });
    }),
  }),
});

export type AppRouter = typeof appRouter;
