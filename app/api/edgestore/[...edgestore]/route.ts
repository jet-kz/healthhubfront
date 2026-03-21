import { initEdgeStore } from '@edgestore/server';
import { createEdgeStoreNextHandler } from '@edgestore/server/adapters/next/app';

const es = initEdgeStore.create();

/**
 * This is the main router for the Edge Store buckets.
 */
const edgeStoreRouter = es.router({
  publicFiles: es.fileBucket()
    /**
     * return `true` to allow upload
     * return `false` to deny upload
     */
    .beforeUpload(({ ctx, input }) => {
      return true; // You can add authentication/authorization logic here using context
    })
    /**
     * return `true` to allow delete
     */
    .beforeDelete(({ ctx, fileInfo }) => {
      return true; // You can add authorization logic here
    }),
});

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
});

export { handler as GET, handler as POST };

/**
 * This type is used to create the type-safe client for the frontend.
 */
export type EdgeStoreRouter = typeof edgeStoreRouter;
