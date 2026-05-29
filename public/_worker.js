export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    // 모든 요청을 Vercel 배포 사이트로 프록시
    const targetUrl = new URL(
      url.pathname + url.search,
      'https://cyber-task-hack.vercel.app'
    );
    return fetch(new Request(targetUrl, request));
  }
};
