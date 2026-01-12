import styles from './feed-card.module.scss';

export default function FeedCard({ feed }) {
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
                            <img src="" alt="" className={styles.user} />
                            <p>feed.lecturerName</p>
                        </>
                    )}
                </div>
                <p className={styles.feed_card_header_date}>post.date</p>
            </div>
            <div className={styles.feed_card_content}>
                <h4>{feed.title}</h4>
                <p>{feed.text}</p>
            </div>
        </div>
    )
}
