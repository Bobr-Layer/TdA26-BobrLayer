import Api from './Api';

const defaultOptions = {
  credentials: 'include',
  headers: {
    'Content-Type': 'application/json',
  },
};

export async function getCourses() {
  const res = await fetch(`${Api}/courses`, {
    ...defaultOptions,
  });

  if (!res.ok) throw new Error('Nepodařilo se načíst kurzy');
  return res.json();
}

export async function createCourse(data) {
  const res = await fetch(`${Api}/courses`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Nepodařilo se vytvořit kurz');
  return res.json();
}

export async function getCourseByUuid(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}`, {
    ...defaultOptions,
  });

  if (!res.ok) throw new Error('Kurz nebyl nalezen');
  return res.json();
}

export async function updateCourse(uuid, data) {
  const res = await fetch(`${Api}/courses/${uuid}`, {
    ...defaultOptions,
    method: 'PUT',
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Nepodařilo se upravit kurz');
  return res.json();
}

export async function deleteCourse(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}`, {
    ...defaultOptions,
    method: 'DELETE',
  });

  if (res.status === 404) throw new Error('Course not found');
  if (!res.ok) throw new Error('Failed to delete course');
}

export async function scheduleCourse(uuid, scheduledAt) {
  const res = await fetch(`${Api}/courses/${uuid}/schedule`, {
    ...defaultOptions,
    method: 'PUT',
    body: JSON.stringify({ scheduledAt }),
  });

  if (!res.ok) throw new Error('Nepodařilo se naplánovat kurz');
  return res.json();
}

export async function backToDraft(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/back-to-draft`, {
    ...defaultOptions,
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Nepodařilo se vrátit kurz do Draft');
  return res.json();
}

export async function startCourse(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/start`, {
    ...defaultOptions,
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Nepodařilo se spustit kurz');
  return res.json();
}

export async function pauseCourse(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/pause`, {
    ...defaultOptions,
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Nepodařilo se pozastavit kurz');
  return res.json();
}

export async function archiveCourse(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/archive`, {
    ...defaultOptions,
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Nepodařilo se archivovat kurz');
  return res.json();
}

export async function activateNextModule(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/modules/activate`, {
    ...defaultOptions,
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Nepodařilo se aktivovat další modul');
  return res.json();
}

export async function deactivatePreviousModule(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/modules/deactivate`, {
    ...defaultOptions,
    method: 'PUT',
  });

  if (!res.ok) throw new Error('Nepodařilo se deaktivovat předchozí modul');
  return res.json();
}

export async function enrollCourse(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/enroll`, {
    ...defaultOptions,
    method: 'POST',
  });

  if (!res.ok) throw new Error('Nepodařilo se přihlásit na kurz');
  return res.json();
}

export async function unenrollCourse(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/enroll`, {
    ...defaultOptions,
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Nepodařilo se odhlásit z kurzu');
  return res.json();
}

export async function isEnrolled(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/enrolled`, {
    ...defaultOptions,
  });

  if (!res.ok) return false;
  const data = await res.json();
  return data.enrolled;
}

export async function getCourseVersions(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/versions`, {
    ...defaultOptions,
  });
  if (!res.ok) throw new Error('Nepodařilo se načíst verze kurzu');
  return res.json();
}

export async function createCourseVersion(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/versions`, {
    ...defaultOptions,
    method: 'POST',
  });
  if (!res.ok) throw new Error('Nepodařilo se vytvořit verzi kurzu');
  return res.json();
}

export async function getCourseVersionContent(courseUuid, shortId) {
  const res = await fetch(`${Api}/courses/${courseUuid}/versions/${shortId}`, {
    ...defaultOptions,
  });
  if (!res.ok) throw new Error('Nepodařilo se načíst verzi kurzu');
  return res.json();
}

export async function rollbackCourseVersion(courseUuid, shortId) {
  const res = await fetch(`${Api}/courses/${courseUuid}/versions/${shortId}/rollback`, {
    ...defaultOptions,
    method: 'POST',
  });
  if (!res.ok) throw new Error('Nepodařilo se obnovit verzi kurzu');
  return res.json();
}

export async function getCourseStudents(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}/users`, {
    ...defaultOptions,
  });
  if (!res.ok) throw new Error('Nepodařilo se načíst studenty');
  return res.json();
}

export async function importCourses(courses) {
  const res = await fetch(`${Api}/courses/import`, {
    ...defaultOptions,
    method: 'POST',
    body: JSON.stringify(courses),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}