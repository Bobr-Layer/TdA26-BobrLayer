import { useState } from 'react';
import styles from './feed-card.module.scss';
import { updateFeedPost, deleteFeedPost } from '../../../services/FeedService';
import { User } from 'lucide-react';

export default function FeedCard({ feed, admin, courseId }) {
    const [showEdit, setShowEdit] = useState(false);
    const [editedMessage, setEditedMessage] = useState(feed.message);
    const [loading, setLoading] = useState(false);

    if (!feed || !feed.uuid || !feed.message) return null;

    const formatDate = (date) => new Intl.DateTimeFormat('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));

    const formattedDate = formatDate(feed.createdAt);
    const formattedUpdatedDate = feed.edited ? formatDate(feed.updatedAt) : null;

    async function handleSave() {
        try {
            setLoading(true);
            const updated = await updateFeedPost(courseId, feed.uuid, { 
                message: editedMessage 
            });
            feed.message = updated.message;
            setShowEdit(false);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete() {
        try {
            setLoading(true);
            await deleteFeedPost(courseId, feed.uuid);
        } catch (err) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={styles.feed_card}>
            <div className={styles.feed_card_header}>
                <div className={styles.feed_card_header_author}>
                    {feed.type === 'system' ? (
                        <>
                            <img src="/img/symbol.png" alt="" />
                            <p>Oznámení</p>
                        </>
                    ) : (
                        <>
                            <div className={styles.img_container} style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                                <User size={24} color="var(--primary-color, black)" />
                            </div>
                            <p>lecturer</p>
                        </>
                    )}
                </div>
                <div className={styles.feed_card_header_date}>
                    <p>{formattedDate}</p>
                </div>
            </div>
            <div className={styles.feed_card_content}>
                {showEdit ? (
                    <>
                        <input
                            type="text"
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                        />
                        <button type="button" onClick={handleSave} disabled={loading}>
                            Uložit
                        </button>
                    </>
                ) : (
                    <h4>{feed.message}</h4>
                )}
            </div>
        </div>
    );
}