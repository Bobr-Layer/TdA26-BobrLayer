import Api from './Api';

export async function getQuizzes(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/quizzes`);

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst kvízy');
  }

  return await res.json();
}

export async function createQuiz(courseUuid, data) {
  const res = await fetch(`${Api}/courses/${courseUuid}/quizzes`, {
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

export async function getQuizByUuid(courseUuid, quizUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/quizzes/${quizUuid}`
  );

  if (!res.ok) {
    throw new Error('Kvíz nebyl nalezen');
  }

  return await res.json();
}

export async function updateQuiz(courseUuid, quizUuid, data) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/quizzes/${quizUuid}`,
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

export async function deleteQuiz(courseUuid, quizUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/quizzes/${quizUuid}`,
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

export async function submitQuiz(courseUuid, quizUuid, data) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/quizzes/${quizUuid}/submit`,
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