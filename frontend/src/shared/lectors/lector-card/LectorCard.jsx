import styles from './lector-card.module.scss';

function LectorCard({ lectorName, lectorMail }) {
    return (
        <div className={styles.lector_card}>
            <div className={styles.img}></div>
            <div>
                <h4>{lectorName}</h4>
                <p>{lectorMail}</p>
            </div>
        </div>
    )
}

export default LectorCard
