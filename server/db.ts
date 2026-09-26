import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  portfolioFiles,
  portfolioProjects,
  portfolioSettings,
  users,
  type InsertPortfolioProject,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];

  for (const field of textFields) {
    const value = user[field];
    if (value !== undefined) {
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

const seededProjects: InsertPortfolioProject[] = [1, 2, 3, 4, 5].map((number, index) => ({
  slug: `project-${String(number).padStart(2, "0")}`,
  title: `Project ${String(number).padStart(2, "0")}`,
  category: null,
  context: null,
  objective: null,
  audience: null,
  role: null,
  tools: null,
  aiContribution: null,
  editingDecisions: null,
  outcome: null,
  videoUrl: null,
  posterUrl: null,
  aspectRatio: null,
  duration: null,
  captionUrl: null,
  transcript: null,
  featured: index === 0 ? 1 : 0,
  displayOrder: index,
  workType: null,
}));

export async function ensurePortfolioSeeded() {
  const db = await getDb();
  if (!db) return;

  const projects = await db.select({ id: portfolioProjects.id }).from(portfolioProjects).limit(1);
  if (projects.length === 0) await db.insert(portfolioProjects).values(seededProjects);

  const settings = await db.select({ id: portfolioSettings.id }).from(portfolioSettings).where(eq(portfolioSettings.id, 1)).limit(1);
  if (settings.length === 0) await db.insert(portfolioSettings).values({ id: 1, cvUrl: null });
}

export async function listPortfolioProjects() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioProjects).orderBy(asc(portfolioProjects.displayOrder), asc(portfolioProjects.id));
}

export async function getPortfolioSettings() {
  const db = await getDb();
  if (!db) return { id: 1, cvUrl: null, updatedAt: null };
  const result = await db.select().from(portfolioSettings).where(eq(portfolioSettings.id, 1)).limit(1);
  return result[0] ?? { id: 1, cvUrl: null, updatedAt: null };
}

export async function updatePortfolioProject(id: number, patch: Partial<InsertPortfolioProject>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (patch.featured === 1) await db.update(portfolioProjects).set({ featured: 0 }).where(eq(portfolioProjects.featured, 1));
  await db.update(portfolioProjects).set(patch).where(eq(portfolioProjects.id, id));
  const result = await db.select().from(portfolioProjects).where(eq(portfolioProjects.id, id)).limit(1);
  return result[0];
}

export async function updatePortfolioSettings(cvUrl: string | null) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(portfolioSettings).values({ id: 1, cvUrl }).onDuplicateKeyUpdate({ set: { cvUrl } });
  return getPortfolioSettings();
}

export async function createPortfolioFile(input: {
  projectId?: number | null;
  kind: string;
  originalName: string;
  mimeType: string;
  sizeBytes?: number | null;
  storageKey: string;
  storageUrl: string;
  createdBy: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(portfolioFiles).values(input);
  const fileId = Number(result[0].insertId);

  if (input.projectId) {
    const urlPatch = input.kind === "video"
      ? { videoUrl: input.storageUrl }
      : input.kind === "poster"
        ? { posterUrl: input.storageUrl }
        : input.kind === "caption"
          ? { captionUrl: input.storageUrl }
          : {};
    if (Object.keys(urlPatch).length > 0) await db.update(portfolioProjects).set(urlPatch).where(eq(portfolioProjects.id, input.projectId));
  }
  if (input.kind === "cv") await updatePortfolioSettings(input.storageUrl);

  const rows = await db.select().from(portfolioFiles).where(eq(portfolioFiles.id, fileId)).limit(1);
  return rows[0];
}

export async function listPortfolioFiles() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(portfolioFiles).orderBy(asc(portfolioFiles.createdAt));
}
