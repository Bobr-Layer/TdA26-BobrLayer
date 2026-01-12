import Api from './Api';

export async function getCourses() {
  const res = await fetch(`${Api}/courses`);

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst kurzy');
  }

  return await res.json();
}

export async function createCourse(data) {
  const res = await fetch(`${Api}/courses`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se vytvořit kurz');
  }

  return await res.json();
}

export async function getCourseByUuid(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}`);

  if (!res.ok) {
    throw new Error('Kurz nebyl nalezen');
  }

  return await res.json();
}

export async function updateCourse(uuid, data) {
  const res = await fetch(`${Api}/courses/${uuid}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se upravit kurz');
  }

  return await res.json();
}

export async function deleteCourse(uuid) {
  const res = await fetch(`${Api}/courses/${uuid}`, { method: 'DELETE' });

  if (res.status === 404) {
    throw new Error('Course not found');
  }

  if (!res.ok) {
    throw new Error('Failed to delete course');
  }

  return;
}