export async function getBranches() {
  const res = await fetch('/api/branches', { credentials: 'include' });
  if (!res.ok) throw new Error('Nepodařilo se načíst pobočky');
  return res.json();
}

export async function createBranch(data) {
  const res = await fetch('/api/branches', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Nepodařilo se vytvořit pobočku');
  return res.json();
}

export async function getBranch(uuid) {
  const res = await fetch(`/api/branches/${uuid}`, { credentials: 'include' });
  if (!res.ok) throw new Error('Nepodařilo se načíst pobočku');
  return res.json();
}

export async function updateBranch(uuid, data) {
  const res = await fetch(`/api/branches/${uuid}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Nepodařilo se uložit pobočku');
  return res.json();
}

export async function getBranchUsers(uuid) {
  const res = await fetch(`/api/branches/${uuid}/users`, { credentials: 'include' });
  if (!res.ok) throw new Error('Nepodařilo se načíst uživatele pobočky');
  return res.json();
}

export async function createBranchUser(uuid, data) {
  const res = await fetch(`/api/branches/${uuid}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Nepodařilo se vytvořit uživatele');
  return res.json();
}
