import { useState } from 'react';
import DashboardButton from '../../button/dashboard/DashboardButton';
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
        <form className={styles.feed_form} onSubmit={handleSubmit}>
            <div className={styles.feed_form_inputs}>
                <input 
                    className={styles.title} 
                    type='text' 
                    placeholder='Napište zprávu...'
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    disabled={isSubmitting}
                />
            </div>
            {error && <p className={styles.error}>{error}</p>}
            <DashboardButton
                text={isSubmitting ? 'Odesílám...' : 'Odeslat zprávu'}
                icon={<svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M24.863 3.13668C24.643 2.91676 24.3683 2.75948 24.0672 2.68104C23.7661 2.60261 23.4496 2.60585 23.1502 2.69043H23.1338L2.14038 9.06043C1.79956 9.15865 1.49664 9.35812 1.27174 9.63239C1.04685 9.90667 0.910612 10.2428 0.881078 10.5963C0.851545 10.9497 0.930111 11.3038 1.10637 11.6116C1.28262 11.9194 1.54824 12.1664 1.86804 12.3198L11.1562 16.8436L15.6733 26.1262C15.8138 26.426 16.0372 26.6794 16.3171 26.8563C16.597 27.0333 16.9216 27.1264 17.2527 27.1248C17.303 27.1248 17.3533 27.1226 17.4037 27.1182C17.7568 27.0896 18.0928 26.9537 18.3665 26.7287C18.6402 26.5037 18.8386 26.2003 18.9349 25.8593L25.3005 4.8659V4.84949C25.3862 4.55086 25.3908 4.2348 25.314 3.93378C25.2371 3.63276 25.0814 3.35764 24.863 3.13668ZM17.2626 25.3584L17.2571 25.3737V25.3661L12.8755 16.3645L18.1255 11.1145C18.2827 10.9491 18.369 10.7288 18.3661 10.5006C18.3632 10.2724 18.2712 10.0544 18.1099 9.8931C17.9485 9.73174 17.7305 9.63981 17.5024 9.63689C17.2742 9.63396 17.0539 9.72029 16.8885 9.87746L11.6385 15.1275L2.63366 10.7459H2.626H2.64132L23.6249 4.3748L17.2626 25.3584Z" fill="white" />
                </svg>}
                submit={true}
                disabled={isSubmitting}
            />
        </form>
    );
}