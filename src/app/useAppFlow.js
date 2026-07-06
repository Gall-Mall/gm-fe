import { useEffect, useMemo, useState } from 'react';
import { createGroup, loadInitialDashboard, submitTasteProfile, submitVote } from '../api';
import { defaultGroup, recommendationCandidates, voteCandidate } from '../data/appData';
import { fallbackMembers, fallbackRecommendations } from '../flow';

function normalizeGroup(dataGroup) {
  if (!dataGroup?.inviteCode) {
    return defaultGroup;
  }

  return {
    ...defaultGroup,
    ...dataGroup,
    city: dataGroup.city || dataGroup.destination || defaultGroup.city,
    date: dataGroup.date || defaultGroup.date,
    readiness: dataGroup.readiness || defaultGroup.readiness,
    inviteCode: dataGroup.inviteCode || defaultGroup.inviteCode,
  };
}

export function useAppFlow() {
  const [activeStep, setActiveStep] = useState('home');
  const [group, setGroup] = useState(defaultGroup);
  const [members, setMembers] = useState(fallbackMembers);
  const [recommendations, setRecommendations] = useState(fallbackRecommendations);
  const [copied, setCopied] = useState('idle');
  const [lastVote, setLastVote] = useState(null);
  const [lastVotedCandidateId, setLastVotedCandidateId] = useState(voteCandidate.id);
  const [lastVoteChange, setLastVoteChange] = useState(null);
  const [scheduledCandidateId, setScheduledCandidateId] = useState(voteCandidate.id);
  const [selectedCandidateId, setSelectedCandidateId] = useState(voteCandidate.id);
  const [selectedVariant, setSelectedVariant] = useState('A');
  const [voteCountsByCandidateId, setVoteCountsByCandidateId] = useState(() =>
    Object.fromEntries(recommendationCandidates.map((candidate) => [candidate.id, candidate.votes])),
  );

  const groupWithRecommendationReadiness = useMemo(
    () => ({
      ...group,
      readiness: Math.max(group.readiness || 0, recommendations[0]?.score ? Math.min(recommendations[0].score, 88) : 75),
    }),
    [group, recommendations],
  );

  const selectedCandidate = useMemo(
    () => recommendationCandidates.find((candidate) => candidate.id === selectedCandidateId) || voteCandidate,
    [selectedCandidateId],
  );

  const resultCandidate = useMemo(
    () => recommendationCandidates.find((candidate) => candidate.id === lastVotedCandidateId) || selectedCandidate,
    [lastVotedCandidateId, selectedCandidate],
  );

  const alternateCandidates = useMemo(
    () => recommendationCandidates.filter((candidate) => candidate.id !== resultCandidate.id),
    [resultCandidate],
  );

  const scheduledCandidate = useMemo(
    () => recommendationCandidates.find((candidate) => candidate.id === scheduledCandidateId) || resultCandidate,
    [resultCandidate, scheduledCandidateId],
  );

  const selectedVoteCounts = voteCountsByCandidateId[selectedCandidate.id] || selectedCandidate.votes;
  const resultVoteCounts = voteCountsByCandidateId[resultCandidate.id] || resultCandidate.votes;
  const scheduledVoteCounts = voteCountsByCandidateId[scheduledCandidate.id] || scheduledCandidate.votes;

  useEffect(() => {
    let mounted = true;

    loadInitialDashboard().then((data) => {
      if (!mounted) {
        return;
      }
      setGroup(normalizeGroup(data.group));
      setMembers(data.members?.length ? data.members : fallbackMembers);
      setRecommendations(data.recommendations?.length ? data.recommendations : fallbackRecommendations);
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const scrollingElement = document.scrollingElement || document.documentElement;
    scrollingElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeStep]);

  function goToStep(step) {
    setActiveStep(step);
  }

  function handleSelectCandidate(candidateId) {
    setSelectedCandidateId(candidateId);
    setSelectedVariant('A');
  }

  async function handleCreate(event, draft) {
    event.preventDefault();
    const created = await createGroup({
      name: draft.name,
      city: draft.destination,
      date: draft.date,
      members: draft.members,
      purposes: [draft.purpose],
    });

    setGroup({
      ...defaultGroup,
      ...created,
      name: created.name || draft.name,
      city: created.city || draft.destination,
      date: created.date || draft.date,
      purpose: draft.purpose,
      inviteCode: created.inviteCode || defaultGroup.inviteCode,
      readiness: 75,
    });
    setActiveStep('dashboard');
  }

  async function handleTasteSubmit(selectedTaste) {
    await submitTasteProfile({ selectedTaste, groupId: group.id || 'mock-group' });
    setMembers((current) =>
      current.map((member) =>
        member.name === '나'
          ? { ...member, status: '완료', type: selectedTaste === '일식' ? '로컬 탐험가형' : '감성 미식가형' }
          : member,
      ),
    );
    setActiveStep('profile');
  }

  async function handleVote(choice) {
    const previousCounts = voteCountsByCandidateId[selectedCandidate.id] || selectedCandidate.votes;

    await submitVote({ choice, restaurant: selectedCandidate.name, groupId: group.id || 'mock-group' });
    setVoteCountsByCandidateId((current) => ({
      ...current,
      [selectedCandidate.id]: {
        ...previousCounts,
        [choice]: previousCounts[choice] + 1,
      },
    }));
    setLastVote(choice);
    setLastVoteChange({
      candidateName: selectedCandidate.name,
      choice,
      before: previousCounts[choice],
      after: previousCounts[choice] + 1,
    });
    setLastVotedCandidateId(selectedCandidate.id);
    setScheduledCandidateId(selectedCandidate.id);
    setSelectedVariant('A');
    setActiveStep('result');
  }

  function handleScheduleCandidate(candidate) {
    setScheduledCandidateId(candidate.id);
    setActiveStep('schedule');
  }

  async function handleCopy() {
    const origin = window.location?.origin || 'http://localhost:5173';
    const inviteText = `${origin}/invite/${group.inviteCode}`;

    try {
      await navigator.clipboard.writeText(inviteText);
      setCopied('success');
    } catch {
      setCopied('error');
    }

    window.setTimeout(() => setCopied('idle'), 1800);
  }

  return {
    activeStep,
    copied,
    goToStep,
    group: groupWithRecommendationReadiness,
    handleCopy,
    handleCreate,
    handleScheduleCandidate,
    handleSelectCandidate,
    handleTasteSubmit,
    handleVote,
    lastVote,
    lastVoteChange,
    members,
    recommendationCandidates,
    resultCandidate,
    resultVoteCounts,
    scheduledCandidate,
    scheduledVoteCounts,
    selectedCandidate,
    selectedCandidateId,
    selectedVariant,
    selectedVoteCounts,
    setSelectedVariant,
  };
}
