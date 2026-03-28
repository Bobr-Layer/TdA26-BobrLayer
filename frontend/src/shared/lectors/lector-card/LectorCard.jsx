import styles from './lector-card.module.scss';

function LectorCard({ lectorName, lectorMail }) {
    return (
        <div className={styles.lector_card}>
            <div className={styles.img_container}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div>
                <h4>{lectorName || 'lecturer'}</h4>
            </div>
        </div>
    )
}

export default LectorCard
