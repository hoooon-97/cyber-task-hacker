export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // 정적 에셋은 그대로 통과
    if (
      pathname.startsWith('/assets/') ||
      pathname.match(/\.(js|css|svg|png|ico|json|woff2?|txt)$/)
    ) {
      return env.ASSETS.fetch(request);
    }

    // 나머지는 SPA entry point
    return env.ASSETS.fetch(new Request(`${url.origin}/index.html`, request));
  }
};
