import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/**
 * Khata renders every signed-in page on request, so it needs no ISR storage.
 * The few pages that are prerendered at build time (the landing page, the
 * legal pages) are served read-only from the static assets.
 */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
