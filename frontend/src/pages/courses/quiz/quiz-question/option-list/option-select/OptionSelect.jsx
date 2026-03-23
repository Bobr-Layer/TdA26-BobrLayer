import styles from './option-select.module.scss';

export default function OptionSelect({ option, multi, selected, setSelected, isReview, correctAnswer }) {

    const isActive = multi
        ? (selected instanceof Set && selected.has(option.id))
        : selected === option.id;

    const isCorrectOption = isReview && (
        multi
            ? (Array.isArray(correctAnswer) && correctAnswer.includes(option.id))
            : correctAnswer === option.id
    );

    const isWrongSelected = isReview && isActive && !isCorrectOption;

    const handleOnClick = () => {
        if (isReview) return;
        if (multi) {
            const next = new Set(selected instanceof Set ? selected : []);
            if (next.has(option.id)) {
                next.delete(option.id);
            } else {
                next.add(option.id);
            }
            setSelected(next);
        } else {
            if (selected === option.id) {
                setSelected(null);
            } else {
                setSelected(option.id);
            }
        }
    };

    return (
        <button
            className={`${styles.option_select} ${isActive ? styles.active : ''} ${isCorrectOption ? styles.correct : ''} ${isWrongSelected ? styles.wrong : ''}`}
            onClick={handleOnClick}
        >
            {option.option}
        </button>
    )
}