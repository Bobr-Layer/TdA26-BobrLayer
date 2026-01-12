import styles from './submit-button.module.scss';

function SubmitButton({ text, onSubmit }) {
    return (
        <button className={styles.submit_button} onSubmit={onSubmit}>
            {text}
        </button>
    )
}

export default SubmitButton
