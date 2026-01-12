import styles from './option-select.module.scss';

export default function OptionSelect({ option, multi, selected, setSelected }) {

    const isActive = multi
        ? (selected instanceof Set && selected.has(option.id))
        : selected === option.id;

    const handleOnClick = () => {
        if (multi) {
            setSelected(prev => {
                const next = new Set(prev instanceof Set ? prev : []);

                if (next.has(option.id)) {
                    next.delete(option.id);
                } else {
                    next.add(option.id);
                }

                return next;
            });
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
            className={`${styles.option_select} ${isActive ? styles.active : ''}`} 
            onClick={handleOnClick}
        >
            {option.option}
        </button>
    )
}