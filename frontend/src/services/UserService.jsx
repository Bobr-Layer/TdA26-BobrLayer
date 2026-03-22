import Api from './Api';

export async function getUsers() {
  const res = await fetch(`${Api}/users`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Nepodařilo se načíst uživatele');
  return res.json();
}

export async function updateUserRole(uuid, role) {
  const res = await fetch(`${Api}/users/${uuid}/role`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Nepodařilo se změnit roli uživatele');
  return res.json();
}

export async function deleteUser(uuid) {
  const res = await fetch(`${Api}/users/${uuid}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Nepodařilo se smazat uživatele');
}
