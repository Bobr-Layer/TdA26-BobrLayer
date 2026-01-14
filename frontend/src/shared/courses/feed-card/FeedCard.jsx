import { useState } from 'react';
import styles from './feed-card.module.scss';
import { updateFeedPost, deleteFeedPost } from '../../../services/FeedService';

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
                            <div className={styles.user} />
                            <p>Neznámý autor</p>
                        </>
                    )}
                </div>
                <div className={styles.feed_card_header_date}>
                    <p>{formattedDate}</p>
                    {admin && feed.type === 'manual' && (
                        <div>
                            <button type='button' onClick={() => {
                                setEditedMessage(feed.message);
                                setShowEdit(true);
                            }}>
                                <svg width="1.25rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M24.862 8.0247L19.9752 3.13673C19.8127 2.97418 19.6197 2.84524 19.4074 2.75727C19.195 2.6693 18.9674 2.62402 18.7376 2.62402C18.5077 2.62402 18.2801 2.6693 18.0678 2.75727C17.8555 2.84524 17.6625 2.97418 17.5 3.13673L4.01298 16.6249C3.84977 16.7868 3.72037 16.9795 3.63231 17.1919C3.54425 17.4042 3.49927 17.632 3.50001 17.8619V22.7499C3.50001 23.214 3.68438 23.6591 4.01257 23.9873C4.34076 24.3155 4.78588 24.4999 5.25001 24.4999H10.138C10.3679 24.5006 10.5956 24.4556 10.808 24.3676C11.0204 24.2795 11.2131 24.1501 11.375 23.9869L24.862 10.4999C25.0246 10.3373 25.1535 10.1444 25.2415 9.93206C25.3295 9.71972 25.3747 9.49212 25.3747 9.26227C25.3747 9.03243 25.3295 8.80483 25.2415 8.59249C25.1535 8.38014 25.0246 8.1872 24.862 8.0247ZM10.138 22.7499H5.25001V17.8619L14.875 8.23688L19.763 13.1249L10.138 22.7499ZM21 11.8867L16.112 6.99985L18.737 4.37485L23.625 9.26173L21 11.8867Z" fill="rgba(0, 112, 187, 1)" />
                                </svg>
                            </button>
                            <button type='button' onClick={handleDelete} disabled={loading}>
                                <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M16.875 3.75H13.75V3.125C13.75 2.62772 13.5525 2.15081 13.2008 1.79917C12.8492 1.44754 12.3723 1.25 11.875 1.25H8.125C7.62772 1.25 7.15081 1.44754 6.79917 1.79917C6.44754 2.15081 6.25 2.62772 6.25 3.125V3.75H3.125C2.95924 3.75 2.80027 3.81585 2.68306 3.93306C2.56585 4.05027 2.5 4.20924 2.5 4.375C2.5 4.54076 2.56585 4.69973 2.68306 4.81694C2.80027 4.93415 2.95924 5 3.125 5H3.75V16.25C3.75 16.5815 3.8817 16.8995 4.11612 17.1339C4.35054 17.3683 4.66848 17.5 5 17.5H15C15.3315 17.5 15.6495 17.3683 15.8839 17.1339C16.1183 16.8995 16.25 16.5815 16.25 16.25V5H16.875C17.0408 5 17.1997 4.93415 17.3169 4.81694C17.4342 4.69973 17.5 4.54076 17.5 4.375C17.5 4.20924 17.4342 4.05027 17.3169 3.93306C17.1997 3.81585 17.0408 3.75 16.875 3.75ZM7.5 3.125C7.5 2.95924 7.56585 2.80027 7.68306 2.68306C7.80027 2.56585 7.95924 2.5 8.125 2.5H11.875C12.0408 2.5 12.1997 2.56585 12.3169 2.68306C12.4342 2.80027 12.5 2.95924 12.5 3.125V3.75H7.5V3.125ZM15 16.25H5V5H15V16.25ZM8.75 8.125V13.125C8.75 13.2908 8.68415 13.4497 8.56694 13.5669C8.44973 13.6842 8.29076 13.75 8.125 13.75C7.95924 13.75 7.80027 13.6842 7.68306 13.5669C7.56585 13.4497 7.5 13.2908 7.5 13.125V8.125C7.5 7.95924 7.56585 7.80027 7.68306 7.68306C7.80027 7.56585 7.95924 7.5 8.125 7.5C8.29076 7.5 8.44973 7.56585 8.56694 7.68306C8.68415 7.80027 8.75 7.95924 8.75 8.125ZM12.5 8.125V13.125C12.5 13.2908 12.4342 13.4497 12.3169 13.5669C12.1997 13.6842 12.0408 13.75 11.875 13.75C11.7092 13.75 11.5503 13.6842 11.4331 13.5669C11.3158 13.4497 11.25 13.2908 11.25 13.125V8.125C11.25 7.95924 11.3158 7.80027 11.4331 7.68306C11.5503 7.56585 11.7092 7.5 11.875 7.5C12.0408 7.5 12.1997 7.56585 12.3169 7.68306C12.4342 7.80027 12.5 7.95924 12.5 8.125Z" fill="rgba(217, 33, 33, 1)" />
                                </svg>
                            </button>
                        </div>
                    )}
                    {feed.edited && (
                        <p className={styles.feed_card_header_date_edit}>
                            (Upraveno: {formattedUpdatedDate})
                        </p>
                    )}
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