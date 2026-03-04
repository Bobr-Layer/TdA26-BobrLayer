import Api from './Api';

export async function getModules(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/modules`);

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst moduly');
  }

  return await res.json();
}

export async function getModuleByUuid(courseUuid, moduleUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}`
  );

  if (res.status === 404) {
    throw new Error('Modul nebyl nalezen');
  }

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst modul');
  }

  return await res.json();
}

export async function createModule(courseUuid, data) {
  const res = await fetch(`${Api}/courses/${courseUuid}/modules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se vytvořit modul');
  }

  return await res.json();
}

export async function updateModule(courseUuid, moduleUuid, data) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (res.status === 404) {
    throw new Error('Modul nebyl nalezen');
  }

  if (!res.ok) {
    throw new Error('Nepodařilo se upravit modul');
  }

  return await res.json();
}

export async function deleteModule(courseUuid, moduleUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}`,
    { method: 'DELETE' }
  );

  if (res.status === 404) {
    throw new Error('Modul nebyl nalezen');
  }

  if (!res.ok) {
    throw new Error('Nepodařilo se smazat modul');
  }

  return;
}