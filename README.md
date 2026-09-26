# Maha Almomani Portfolio

A full-stack React + TypeScript portfolio for Maha Almomani, a Marketing & Social Media Specialist based in Amman, Jordan. The public site keeps its editorial petrol/ivory/lime/coral design while project records, settings, and uploaded-file metadata are now persisted.

## What was added

The project now uses the WebDev full-stack template with Express, tRPC, Manus OAuth, Drizzle ORM, and MySQL/TiDB. The public portfolio reads its five project records and CV setting through `portfolio.publicData`; if the database is temporarily unavailable, the original static configuration remains available as a safe rendering fallback.

The private `/studio` route is protected by Manus authentication and admin authorization. It provides a DashboardLayout-based editor for the five project records, featured state, CV delivery link, and media uploads. The database stores project/settings/file metadata only. Uploaded bytes are sent directly to built-in object storage through a server-issued presigned URL; the resulting `/manus-storage/...` reference is persisted in the database.

## Run and verify locally

```bash
pnpm install
pnpm dev
```

Validation commands:

```bash
pnpm check
pnpm test
pnpm build
```

## Database

The schema is in `drizzle/schema.ts` and includes:

- `users` for Manus OAuth identities and admin roles.
- `portfolioSettings` for the configurable CV URL.
- `portfolioProjects` for the five editable project records.
- `portfolioFiles` for uploaded-file metadata and storage references.

The initial migration is in `drizzle/0000_sticky_next_avengers.sql` and has been applied to the configured database. When changing the schema later, run `pnpm drizzle-kit generate`, review the generated SQL, and apply it through the WebDev database migration flow.

The first public-data request seeds five honest records named `Project 01` through `Project 05` plus the single settings record when the database is empty. No invented project details or media are inserted.

## Studio and authentication

Open `/studio` while signed in through Manus OAuth. The route requires an authenticated admin user. The project owner is promoted to admin by the generated OAuth user upsert when the configured owner identity matches `OWNER_OPEN_ID`.

The Studio editor supports:

- Editing all requested project fields, including exact contribution, editing decisions, AI contribution, verified outcome, aspect ratio, duration, captions, and transcript.
- Marking one project as featured.
- Saving the CV URL without showing a broken public CV control when the value is empty.
- Uploading video, poster, caption, and CV files.
- Saving file metadata and linking uploaded media to the appropriate project field.

## File storage flow

The client requests a presigned upload URL from the protected `portfolio.requestUpload` procedure. The browser uploads the chosen file directly to object storage using that URL. The client then calls `portfolio.completeUpload`, which persists the storage key and public `/manus-storage/...` URL in `portfolioFiles` and, for videos/posters/captions/CV files, updates the corresponding project or settings record.

The upload UI accepts files up to 2 GB and validates the storage-key prefix against the authenticated user. Keep large files out of `client/public` and `client/src/assets`. Cloudinary HTTPS URLs remain supported in the project editor for externally hosted videos.

## Source-of-truth files

- `client/src/lib/siteConfig.ts` — verified static profile copy and fallback configuration.
- `client/src/pages/Home.tsx` — public portfolio and database hydration.
- `client/src/pages/Studio.tsx` — protected editor and upload UI.
- `drizzle/schema.ts` — persistent schema.
- `server/db.ts` — database helpers and seeding.
- `server/routers.ts` — public/admin tRPC procedures.
- `server/storage.ts` — built-in object storage presigning and serving helpers.

## Verified in this handoff

The TypeScript check, existing auth test, and production build pass. The public route renders the five database-seeded project records. The `/studio` route correctly gates access behind authentication. The public layout, responsive styling, and original accessible project dialog remain in place.

Real work media, verified project descriptions/outcomes, optional captions/transcripts, and the final CV are still intentionally empty until supplied.
