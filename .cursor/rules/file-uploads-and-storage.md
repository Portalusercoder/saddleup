---
name: file-uploads-and-storage
description: Use when handling user file uploads — upload directly to S3/R2/Supabase Storage with presigned URLs, validate type and size, scope objects per tenant, and serve them back securely without proxying bytes through your server.
---

# File Uploads & Storage

## Overview

Don't stream uploads through your app server — it's slow, memory-hungry, and hits serverless body limits. Instead, issue a **presigned URL** so the browser uploads **directly to object storage** (S3, Cloudflare R2, or Supabase Storage), then store only the object key + metadata in your DB. Validate type/size before signing, namespace keys per tenant, and serve private files via short-lived signed download URLs.

## When to use

- Users upload avatars, attachments, imports, or documents.
- Files are large or uploads are slow/timing out through your API.
- You need per-tenant access control on stored files.

## Presigned upload

```ts
// src/app/api/uploads/sign/route.ts
import { z } from "zod";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { requireOrg } from "@/server/auth/active-org";

const Body = z.object({
  filename: z.string().max(200),
  contentType: z.enum(["image/png", "image/jpeg", "application/pdf"]), // allowlist
  size: z.number().int().positive().max(10 * 1024 * 1024),             // 10MB cap
});

const s3 = new S3Client({ region: "auto" });

export async function POST(req: Request) {
  const { org } = await requireOrg(new URL(req.url).searchParams.get("org")!);
  const { filename, contentType } = Body.parse(await req.json());

  const key = `orgs/${org.id}/${crypto.randomUUID()}/${filename}`;   // tenant-scoped key
  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({ Bucket: "uploads", Key: key, ContentType: contentType }),
    { expiresIn: 60 },
  );
  return Response.json({ url, key });
}
```

The client `PUT`s the file to `url`, then tells your API the `key` to persist (in a tenant-scoped row).

## Serving files back

- **Private by default.** Buckets block public reads; generate short-lived signed **GET** URLs on demand.
- **Authorize downloads** — verify the requester's org owns the `key` before signing.
- **Process async** — thumbnails/virus-scan/transcode run in `background-jobs`, keyed off the upload.

## Pitfalls

- **Proxying bytes through the API** — memory blowups and serverless payload limits; use presigned URLs.
- **Trusting client-reported content-type/size** — allowlist types and cap size in the signing request; verify after upload.
- **Public buckets for private data** — leaks every file via a guessable URL. Keep private, sign reads.
- **Un-namespaced keys** — without `orgs/<id>/...`, one tenant can reference another's objects.
- **Storing the file in Postgres** — store the key + metadata; keep bytes in object storage.

## Hand-off

Direct-to-storage uploads with tenant-scoped keys. `background-jobs` post-processes; `data-access-layer` stores keys; `observability-and-errors` tracks failures.
