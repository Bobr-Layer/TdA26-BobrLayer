import Api from './Api';

export async function getQuizzes(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/quizzes`);

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst kvízy');
  }

  return await res.json();
}

export async function createQuiz(courseUuid, moduleUuid, data) {
  const res = await fetch(`${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se vytvořit kvíz');
  }

  return await res.json();
}

export async function getQuizByUuid(courseUuid, moduleUuid, quizUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}`
  );

  if (!res.ok) {
    throw new Error('Kvíz nebyl nalezen');
  }

  return await res.json();
}

export async function updateQuiz(courseUuid, moduleUuid, quizUuid, data) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error('Nepodařilo se upravit kvíz');
  }

  return await res.json();
}

export async function deleteQuiz(courseUuid, moduleUuid, quizUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}`,
    { method: 'DELETE' }
  );

  if (res.status === 404) {
    throw new Error('Kvíz nebyl nalezen');
  }

  if (!res.ok) {
    throw new Error('Nepodařilo se smazat kvíz');
  }

  return;
}

export async function submitQuiz(courseUuid, moduleUuid, quizUuid, data) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}/submit`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error('Nepodařilo se odeslat kvíz');
  }

  return await res.json();
}