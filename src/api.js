const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('access_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiHealth() {
  const res = await fetch(`${API_BASE}/health`, { headers: getAuthHeaders() });
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function registerTeam(name, password) {
  const res = await fetch(`${API_BASE}/teams/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Registration failed');
  if (data.access_token) localStorage.setItem('access_token', data.access_token);
  if (data.team_code) localStorage.setItem('team_code', data.team_code);
  if (data.team_id) localStorage.setItem('team_id', data.team_id);
  return data;
}

export async function loginTeam(team_code, password) {
  const res = await fetch(`${API_BASE}/teams/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ team_code, password })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  if (data.access_token) localStorage.setItem('access_token', data.access_token);
  if (data.team_id) localStorage.setItem('team_id', data.team_id);
  return data;
}

export async function getGameStatus() {
  const res = await fetch(`${API_BASE}/game/status`, { headers: getAuthHeaders() });
  if (res.status === 401) throw new Error('Unauthorized');
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to fetch status');
  return data;
}

export async function solveCurrentPage(answer) {
  const res = await fetch(`${API_BASE}/game/solve`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ answer })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Solve failed');
  return data;
}

export async function guessLetter(letter) {
  const res = await fetch(`${API_BASE}/game/guess-letter`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ letter })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Letter guess failed');
  return data;
}

export async function guessWord(guess) {
  const res = await fetch(`${API_BASE}/game/guess-word`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ guess })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Word guess failed');
  return data;
}


