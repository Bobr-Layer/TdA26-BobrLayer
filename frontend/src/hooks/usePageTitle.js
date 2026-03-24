import { useEffect } from 'react';

export function usePageTitle(title) {
    useEffect(() => {
        document.title = title ? `${title} | Think different Academy` : 'Think different Academy';
    }, [title]);
}
