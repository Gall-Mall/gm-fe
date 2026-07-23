const defaultBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

function trimTrailingSlash(value) {
  return value.replace(/\/+$/, '');
}

async function readResponseBody(response) {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export async function createVoteSession(
  groupId,
  request,
  { baseUrl = defaultBaseUrl, fetcher = fetch } = {},
) {
  if (!groupId) {
    throw new Error('투표를 시작할 그룹 ID가 없습니다.');
  }
  const response = await fetcher(
    `${trimTrailingSlash(baseUrl)}/api/groups/${groupId}/vote-sessions`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    },
  );
  const body = await readResponseBody(response);

  if (!response.ok) {
    throw new Error(body?.message || body?.error?.message || `투표 세션 생성에 실패했습니다. (${response.status})`);
  }
  if (!body?.data?.voteSessionId) {
    throw new Error('투표 세션 생성 응답에 voteSessionId가 없습니다.');
  }

  return body.data;
}
