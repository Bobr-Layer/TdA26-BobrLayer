import Api from './Api';

export async function login(username, password) {
  const res = await fetch(`${Api}/auth/login`, {
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

export async function register(username, password) {
  const res = await fetch(`${Api}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Registrace selhala');
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

export async function updateProfile(data) {
  const res = await fetch(`${Api}/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Úprava profilu selhala');
  }

  return await res.json();
}

export async function getMyEnrolledCourses() {
  const res = await fetch(`${Api}/auth/me/courses`, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst vaše kurzy');
  }

  return await res.json();
}