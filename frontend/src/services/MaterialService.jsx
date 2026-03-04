import Api from './Api';

export async function getMaterials(courseId, moduleUuid) {
  const res = await fetch(`${Api}/courses/${courseId}/modules/${moduleUuid}/materials`);

  if (!res.ok) {
    throw new Error('Nepodařilo se načíst materiály kurzu');
  }

  return await res.json();
}

export async function getFileMaterials(courseId) {
  const materials = await getMaterials(courseId);
  return materials.filter(m => m.type === 'file');
}

export async function getUrlMaterials(courseId) {
  const materials = await getMaterials(courseId);
  return materials.filter(m => m.type === 'url');
}

export async function createFileMaterial(courseId, moduleUuid, data) {
  const formData = new FormData();
  formData.append('type', 'file');
  formData.append('name', data.name);
  formData.append('description', data.description || '');
  formData.append('file', data.file);

  const res = await fetch(`${Api}/courses/${courseId}/modules/${moduleUuid}/materials`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error response:', errorText);
    throw new Error(`Nepodařilo se vytvořit materiál (soubor): ${res.status} - ${errorText}`);
  }

  return await res.json();
}

export async function createUrlMaterial(courseId, moduleUuid, data) {
  const res = await fetch(`${Api}/courses/${courseId}/modules/${moduleUuid}/materials`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'url',
      name: data.name,
      description: data.description || '',
      url: data.url,
    }),
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se vytvořit materiál (odkaz)');
  }

  return await res.json();
}

export async function updateFileMaterial(courseId, moduleUuid, materialId, data) {
  const formData = new FormData();
  if (data.name) formData.append('name', data.name);
  if (data.description) formData.append('description', data.description);
  if (data.file) formData.append('file', data.file);

  const res = await fetch(`${Api}/courses/${courseId}/modules/${moduleUuid}/materials/${materialId}`, {
    method: 'PUT',
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se aktualizovat materiál (soubor)');
  }

  return await res.json();
}

export async function updateUrlMaterial(courseId, moduleUuid, materialId, data) {
  const res = await fetch(`${Api}/courses/${courseId}/modules/${moduleUuid}/materials/${materialId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: data.name,
      description: data.description,
      url: data.url,
    }),
  });

  if (!res.ok) {
    throw new Error('Nepodařilo se aktualizovat materiál (odkaz)');
  }

  return await res.json();
}

export async function deleteMaterial(courseId, moduleUuid, materialId) {
  const res = await fetch(`${Api}/courses/${courseId}/modules/${moduleUuid}/materials/${materialId}`, {
    method: 'DELETE',
  });

  if (!res.ok && res.status !== 204) {
    throw new Error('Nepodařilo se smazat materiál');
  }

  return;
}
