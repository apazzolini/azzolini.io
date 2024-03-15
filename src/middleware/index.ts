import { defineMiddleware } from 'astro:middleware';

const requests: Record<string, number> = {};
setInterval(
  () => {
    console.log(JSON.stringify(requests, null, 2));
  },
  1000 * 60 * 30,
);

export const onRequest = defineMiddleware((context, next) => {
  const key = context.url.pathname;
  if (key) {
    requests[key] = (requests[key] ?? 0) + 1;
  }
  return next();
});
