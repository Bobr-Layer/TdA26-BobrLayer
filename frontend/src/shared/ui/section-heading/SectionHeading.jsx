import styles from './section-heading.module.scss';

export default function SectionHeading({ label, heading, as: Tag = 'h2' }) {
    return (
        <div className={styles.section_heading}>
            <span className={styles.label}>{label}</span>
            <Tag className={styles.heading}>{heading}</Tag>
        </div>
    );
}
