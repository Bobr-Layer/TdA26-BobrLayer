import Api from './Api';

export async function login(username, password) {
  const res = await fetch('http://localhost:8080/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Neplatné přihlašovací údaje');
  }

  return await res.json();
}

export async function logout() {
  const res = await fetch(`${Api}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Odhlášení selhalo');
  }

  return await res.text();
}

export async function getCurrentUser() {
  const res = await fetch(`${Api}/auth/me`, {
    credentials: 'include',
  });

  if (!res.ok) {
    return null;
  }

  return await res.json();
}