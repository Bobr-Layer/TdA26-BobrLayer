import Api from './Api';

export async function getQuizzes(courseUuid) {
  const res = await fetch(`${Api}/courses/${courseUuid}/quizzes`, { credentials: 'include' });

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst kvízy');
  }

  return await res.json();
}

export async function createQuiz(courseUuid, moduleUuid, data) {
  const res = await fetch(`${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se vytvořit kvíz');
  }

  return await res.json();
}

export async function getQuizByUuid(courseUuid, moduleUuid, quizUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}`,
    { credentials: 'include' }
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
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
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
    { method: 'DELETE', credentials: 'include' }
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
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    }
  );

  if (!res.ok) {
    throw new Error('Nepodařilo se odeslat kvíz');
  }

  return await res.json();
}

export async function getQuizAttempts(courseUuid, moduleUuid, quizUuid, { search, pendingReview } = {}) {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (pendingReview !== undefined && pendingReview !== null) params.append('pendingReview', pendingReview);
  const query = params.toString() ? `?${params}` : '';

  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}/attempts${query}`,
    { credentials: 'include' }
  );

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst pokusy');
  }

  return await res.json();
}

export async function getMyAttempt(courseUuid, moduleUuid, quizUuid) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}/my-attempt`,
    { credentials: 'include' }
  );
  if (res.status === 404) return null;
  if (!res.ok) throw new Error('Nepodařilo se načíst pokus');
  return await res.json();
}

export async function evaluateAttempt(courseUuid, moduleUuid, quizUuid, attemptUuid, evaluations) {
  const res = await fetch(
    `${Api}/courses/${courseUuid}/modules/${moduleUuid}/quizzes/${quizUuid}/attempts/${attemptUuid}/evaluate`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ evaluations }),
    }
  );

  if (!res.ok) {
    throw new Error('Nepodařilo se uložit hodnocení');
  }
}