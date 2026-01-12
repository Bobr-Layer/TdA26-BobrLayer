import styles from './input.module.scss';

function Input(
    {
        type = "text",
        name,
        value,
        onChange,
        placeholder,
        longer,
        required,
        title
    }
) {
    return (
        <input
            className={`${styles.input} ${longer ? styles.bigger : ''} ${title ? styles.title : ''}`}
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
        >
        </input>
    )
}

export default Input
