// Two routes, both forwarded byte for byte; the relay keeps no state and logs nothing.
//
//   POST /api/listenWebHook          Telegram -> server. The server itself checks
//                                    the secret token header, so it is passed on.
//   /bot<id>:..., /file/bot<id>:...  server -> Bot API. Limited to our bot, or the
//                                    Worker would be an open Telegram proxy.

type Env = {UPSTREAM: string, BOT_ID: string};

const TELEGRAM = 'https://api.telegram.org';
const WEBHOOK_PATH = '/api/listenWebHook';

const forward = (target: string, request: Request, headerNames: string[]): Promise<Response> => {
  const headers = new Headers();
  for (const name of headerNames) {
    const value = request.headers.get(name);
    if (value !== null) {
      headers.set(name, value);
    }
  }

  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  return fetch(target, {method: request.method, headers, body: hasBody ? request.body : undefined});
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === WEBHOOK_PATH && request.method === 'POST') {
      return forward(env.UPSTREAM + WEBHOOK_PATH, request, ['content-type', 'x-telegram-bot-api-secret-token']);
    }

    if (url.pathname.startsWith(`/bot${env.BOT_ID}:`) || url.pathname.startsWith(`/file/bot${env.BOT_ID}:`)) {
      return forward(TELEGRAM + url.pathname + url.search, request, ['content-type']);
    }

    return new Response('Not found', {status: 404});
  },
};
