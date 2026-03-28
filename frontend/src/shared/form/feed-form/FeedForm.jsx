import { useState } from 'react';
import styles from './feed-form.module.scss';
import { createFeedPost } from '../../../services/FeedService';

export default function FeedForm({ courseId }) {
    const [message, setMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) {
            setError('Zpráva nemůže být prázdná');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await createFeedPost(courseId, { message: message.trim() });
            setMessage('');
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <form className={styles.feed_form} onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Napište zprávu..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                />
                <button type="submit" disabled={isSubmitting}>
                    <svg width="16" height="16" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M24.863 3.13692C24.643 2.917 24.3683 2.75973 24.0672 2.68129C23.7661 2.60285 23.4496 2.60609 23.1502 2.69067H23.1338L2.14038 9.06067C1.79956 9.15889 1.49664 9.35836 1.27174 9.63264C1.04685 9.90692 0.910612 10.2431 0.881078 10.5965C0.851545 10.95 0.930111 11.3041 1.10637 11.6119C1.28262 11.9197 1.54824 12.1666 1.86804 12.32L11.1562 16.8438L15.6733 26.1265C15.8138 26.4263 16.0372 26.6796 16.3171 26.8566C16.597 27.0335 16.9216 27.1267 17.2527 27.125C17.303 27.125 17.3533 27.1229 17.4037 27.1185C17.7568 27.0899 18.0928 26.954 18.3665 26.7289C18.6402 26.5039 18.8386 26.2006 18.9349 25.8596L25.3005 4.86614V4.84973C25.3862 4.5511 25.3908 4.23504 25.314 3.93402C25.2371 3.63301 25.0814 3.35788 24.863 3.13692ZM17.2626 25.3586L17.2571 25.374V25.3663L12.8755 16.3647L18.1255 11.1147C18.2827 10.9493 18.369 10.729 18.3661 10.5009C18.3632 10.2727 18.2712 10.0547 18.1099 9.89334C17.9485 9.73199 17.7305 9.64005 17.5024 9.63713C17.2742 9.63421 17.0539 9.72053 16.8885 9.8777L11.6385 15.1277L2.63366 10.7461H2.626H2.64132L23.6249 4.37505L17.2626 25.3586Z" fill="currentColor" />
                    </svg>
                </button>
            </form>
            {error && <p className={styles.error}>{error}</p>}
        </>
    );
}
