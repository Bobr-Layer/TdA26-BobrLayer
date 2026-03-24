import { User } from 'lucide-react';
import styles from './lector-card.module.scss';

function LectorCard({ lectorName, lectorMail }) {
    return (
        <div className={styles.lector_card}>
            <div className={styles.img_container}>
                <User size={20} color="white" />
            </div>
            <div>
                <h4>{lectorName || 'lecturer'}</h4>
            </div>
        </div>
    )
}

export default LectorCard
