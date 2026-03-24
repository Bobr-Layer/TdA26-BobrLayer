import { useState } from 'react';

export function useToast(duration = 4000) {
    const [toast, setToast] = useState(null);

    const showToast = (message) => {
        setToast(message);
        setTimeout(() => setToast(null), duration);
    };

    return { toast, showToast };
}
