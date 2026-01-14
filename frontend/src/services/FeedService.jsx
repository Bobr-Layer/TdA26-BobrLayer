import Api from './Api';

export async function getCourseFeed(courseId) {
    const res = await fetch(`${Api}/courses/${courseId}/feed`);
    if (!res.ok) throw new Error('Nepodařilo se načíst feed kurzu');
    return await res.json();
}

export async function createFeedPost(courseId, data) {
    const res = await fetch(`${Api}/courses/${courseId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Nepodařilo se vytvořit příspěvek');
    return await res.json();
}

export async function updateFeedPost(courseId, postId, data) {
    const res = await fetch(`${Api}/courses/${courseId}/feed/${postId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Nepodařilo se upravit příspěvek');
    return await res.json();
}

export async function deleteFeedPost(courseId, postId) {
    const res = await fetch(`${Api}/courses/${courseId}/feed/${postId}`, {
        method: 'DELETE',
    });
    if (res.status === 404) throw new Error('Příspěvek nebyl nalezen');
    if (!res.ok) throw new Error('Nepodařilo se smazat příspěvek');
}

export function subscribeToFeedStream(courseId, onMessage, onError) {
    const eventSource = new EventSource(`${Api}/courses/${courseId}/feed/stream`);

    eventSource.addEventListener('new_post', (event) => {
        try {
            const data = JSON.parse(event.data);
            if (!data.uuid || !data.message) return;
            onMessage(data);
        } catch (error) {
            console.error('Error parsing SSE data:', error);
        }
    });

    eventSource.onerror = (error) => {
        if (eventSource.readyState === EventSource.CLOSED) return;
        if (onError) onError(error);
    };

    return () => {
        if (eventSource.readyState !== EventSource.CLOSED) eventSource.close();
    };
}