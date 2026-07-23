import { describe, expect, it, vi } from 'vitest';
import { subscribeVoteSession } from './voteSessionSocket';

class FakeClient {
  static latest;

  constructor(config) {
    this.config = config;
    this.subscribe = vi.fn((destination, callback) => {
      this.destination = destination;
      this.messageCallback = callback;
      return { unsubscribe: vi.fn() };
    });
    this.deactivate = vi.fn().mockResolvedValue(undefined);
    FakeClient.latest = this;
  }

  activate() {
    this.config.onConnect();
  }
}

describe('subscribeVoteSession', () => {
  it('WebSocket 연결 후 반환된 투표 세션 topic을 구독한다', async () => {
    const onEvent = vi.fn();

    const connection = await subscribeVoteSession('session-1', onEvent, {
      brokerUrl: 'ws://localhost:8080/ws',
      ClientClass: FakeClient,
    });

    expect(FakeClient.latest.config.brokerURL).toBe('ws://localhost:8080/ws');
    expect(FakeClient.latest.destination).toBe('/topic/vote-sessions/session-1');

    FakeClient.latest.messageCallback({ body: JSON.stringify({ type: 'MENU_CANDIDATES_READY' }) });
    expect(onEvent).toHaveBeenCalledWith({ type: 'MENU_CANDIDATES_READY' });

    await connection.disconnect();
    expect(FakeClient.latest.deactivate).toHaveBeenCalledOnce();
  });

  it('STOMP 연결 오류가 발생하면 구독 Promise를 실패시킨다', async () => {
    class FailedClient extends FakeClient {
      activate() {
        this.config.onStompError({ headers: { message: '연결 거부' } });
      }
    }

    await expect(subscribeVoteSession('session-1', vi.fn(), {
      brokerUrl: 'ws://localhost:8080/ws',
      ClientClass: FailedClient,
    })).rejects.toThrow('연결 거부');
  });

  it('WebSocket 주소가 없으면 현재 origin의 /ws를 사용한다', async () => {
    await subscribeVoteSession('session-1', vi.fn(), { ClientClass: FakeClient });

    expect(FakeClient.latest.config.brokerURL).toBe('ws://localhost:3000/ws');
  });
});
