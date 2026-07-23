export async function createAndSubscribeVoteSession({
  groupId,
  request,
  onEvent,
  onSessionCreated,
  createVoteSession,
  subscribeVoteSession,
}) {
  const voteSession = await createVoteSession(groupId, request);
  onSessionCreated?.(voteSession);
  const connection = await subscribeVoteSession(voteSession.voteSessionId, onEvent);

  return { voteSession, connection };
}
