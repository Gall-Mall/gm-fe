import { fallbackGroup, fallbackMembers, fallbackRecommendations } from './flow';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

async function request(path, options = {}) {
  if (!API_BASE_URL) {
    throw new Error('API base URL is not configured');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function loadInitialDashboard() {
  try {
    return await request('/api/groups/current');
  } catch {
    return {
      group: fallbackGroup,
      members: fallbackMembers,
      recommendations: fallbackRecommendations,
    };
  }
}

export async function createGroup(group) {
  try {
    return await request('/api/groups', {
      method: 'POST',
      body: JSON.stringify(group),
    });
  } catch {
    return {
      ...group,
      id: 'mock-group',
      inviteCode: 'GALM24',
    };
  }
}

export async function submitTasteProfile(profile) {
  try {
    return await request('/api/taste-profiles', {
      method: 'POST',
      body: JSON.stringify(profile),
    });
  } catch {
    return {
      resultType: '도전적인 미식 여행자형',
      selectedTaste: profile.selectedTaste,
    };
  }
}

export async function submitVote(vote) {
  try {
    return await request('/api/votes', {
      method: 'POST',
      body: JSON.stringify(vote),
    });
  } catch {
    return {
      saved: true,
      choice: vote.choice,
    };
  }
}
