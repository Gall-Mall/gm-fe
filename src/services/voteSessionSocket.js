import { Client } from '@stomp/stompjs';

function defaultBrokerUrl() {
  if (import.meta.env.VITE_WS_URL) {
    return import.meta.env.VITE_WS_URL;
  }

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  if (apiBaseUrl) {
    return `${apiBaseUrl.replace(/^http/, 'ws').replace(/\/+$/, '')}/ws`;
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/ws`;
}

export function subscribeVoteSession(
  voteSessionId,
  onEvent,
  {
    brokerUrl = defaultBrokerUrl(),
    ClientClass = Client,
    connectionTimeoutMs = 5000,
  } = {},
) {
  if (!voteSessionId) {
    return Promise.reject(new Error('구독할 voteSessionId가 없습니다.'));
  }
  return new Promise((resolve, reject) => {
    let settled = false;
    let subscription;

    const finishWithError = (error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      reject(error);
    };

    const client = new ClientClass({
      brokerURL: brokerUrl,
      reconnectDelay: 5000,
      onConnect: () => {
        subscription = client.subscribe(
          `/topic/vote-sessions/${voteSessionId}`,
          (message) => {
            try {
              onEvent(JSON.parse(message.body));
            } catch {
              // 잘못된 이벤트 한 건이 연결 전체를 중단하지 않도록 무시한다.
            }
          },
        );
        settled = true;
        window.clearTimeout(timeoutId);
        resolve({
          disconnect: async () => {
            subscription?.unsubscribe?.();
            await client.deactivate();
          },
        });
      },
      onStompError: (frame) => {
        finishWithError(new Error(frame.headers?.message || 'STOMP 연결에 실패했습니다.'));
      },
      onWebSocketError: () => {
        finishWithError(new Error('WebSocket 연결에 실패했습니다.'));
      },
    });

    const timeoutId = window.setTimeout(() => {
      finishWithError(new Error('WebSocket 연결 시간이 초과되었습니다.'));
      client.deactivate();
    }, connectionTimeoutMs);

    client.activate();
  });
}
