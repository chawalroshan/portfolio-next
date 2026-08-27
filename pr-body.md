Fixes multiple build errors:

1. **Prisma schema** - Added missing `url` and `directUrl` fields to datasource block (required for Prisma CLI)

2. **Root opengraph-image route** (`src/app/opengraph-image.tsx`) - Added `export const dynamic = 'force-dynamic'` to prevent static generation errors

3. **Blog opengraph-image route** (`src/app/(site)/blog/[slug]/opengraph-image.tsx`) - Added `force-dynamic`

4. **Projects opengraph-image route** (`src/app/(site)/projects/[slug]/opengraph-image.tsx`) - Added `force-dynamic`

5. **Blog page metadata** (`src/app/(site)/blog/[slug]/page.tsx`) - Fixed `publishedAt` date handling by converting to `Date` before calling `.toISOString()` (Prisma returns string/DateTime, not Date object)

All fixes verified: `npm run build` passes, `npx tsc --noEmit` passes, `prisma db seed` works.