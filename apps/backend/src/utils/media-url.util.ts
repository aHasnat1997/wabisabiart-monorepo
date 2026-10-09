import z from 'zod';

const BUCKET_NAME = 'rightkitkatie-media';

if (!BUCKET_NAME) {
  throw new Error('Missing required environment variable: BUCKET_NAME');
}

/**
 * Normalizes a mediaUrl to always be a relative path like "/folder/file.ext"
 *
 * Accepts:
 *  ✅ Full URL with bucket:   "http://172.16.100.166:9000/rightkitkatie-media/images/123-photo.jpg"
 *                           → "/images/123-photo.jpg"
 *  ✅ Already relative:       "/images/123-photo.jpg"
 *                           → "/images/123-photo.jpg"
 *  ✅ Relative without slash: "images/123-photo.jpg"
 *                           → "/images/123-photo.jpg"
 *
 * Rejects:
 *  ❌ Full URL missing bucket:  "http://172.16.100.166:9000/other-bucket/images/photo.jpg"
 *  ❌ Relative with bucket:     "/rightkitkatie-media/images/photo.jpg"
 *  ❌ No folder structure:      "photo.jpg"
 */
const normalizeMediaUrl = (
  url: string,
): { success: true; value: string } | { success: false; error: string } => {
  // ── Case 1: Full URL ──────────────────────────────────────────────────────
  if (/^https?:\/\//i.test(url)) {
    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      return { success: false, error: 'Invalid URL format.' };
    }

    // pathname → "/rightkitkatie-media/images/123-photo.jpg"
    const segments = parsed.pathname.split('/').filter(Boolean);

    // segments[0] must be the bucket name
    if (segments[0] !== BUCKET_NAME) {
      return {
        success: false,
        error: `URL must include the bucket "${BUCKET_NAME}" immediately after the domain. Got "${segments[0] ?? ''}" instead.`,
      };
    }

    segments.shift(); // drop the bucket name
    return { success: true, value: '/' + segments.join('/') };
  }

  // ── Case 2: Relative path ─────────────────────────────────────────────────
  const normalized = url.startsWith('/') ? url : '/' + url;

  // Reject if the relative path still contains the bucket as a prefix
  if (normalized.startsWith(`/${BUCKET_NAME}`)) {
    return {
      success: false,
      error: `Relative path must not include the bucket name "/${BUCKET_NAME}". Provide the path after the bucket, e.g. "/images/photo.jpg".`,
    };
  }

  return { success: true, value: normalized };
};

/**
 * A reusable Zod schema for any `mediaUrl` field across the app.
 *
 * - Strips the RustFS bucket name from full URLs automatically
 * - Ensures a clean "/folder/filename" path is stored in the DB
 * - Reads the bucket name from `process.env.BUCKET_NAME`
 *
 * @example
 * // Required
 * const schema = z.object({ mediaUrl: mediaUrlSchema });
 *
 * // Optional / nullable
 * const schema = z.object({ mediaUrl: mediaUrlSchema.optional().nullable() });
 */
export const mediaUrlSchema = z.string().transform((val, ctx) => {
  const result = normalizeMediaUrl(val);

  if (!result.success) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, message: result.error });
    return z.NEVER;
  }

  // Must have at least "/folder/filename" structure
  if (!/^\/[^/]+\/[^/\s]+/.test(result.value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'mediaUrl must contain at least one folder and a filename, e.g. "/images/photo.jpg".',
    });
    return z.NEVER;
  }

  return result.value;
});

/**
 * TypeScript type inferred from the mediaUrl schema (post-transform output).
 *
 * @example
 * type MyDto = { mediaUrl: MediaUrl };
 */
export type MediaUrl = z.infer<typeof mediaUrlSchema>;
