import styles from './textarea.module.scss';

function Textarea(
    {
        name,
        value,
        onChange,
        placeholder,
        longer,
        bigger
    }
) {
    return (
        <textarea
            className={`${styles.textarea} ${longer ? styles.longer : ''} ${bigger ? styles.bigger : ''}`}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={5}
        />
    )
}

export default Textarea
