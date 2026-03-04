import { useState, useEffect } from 'react';
import styles from './option-list.module.scss';
import OptionSelect from './option-select/OptionSelect';

export default function OptionList({
    multi,
    options,
    questionId,
    currentAnswer,
    onAnswerChange,
    disabled
}) {
    const [selected, setSelected] = useState(() => {
        if (currentAnswer !== undefined && currentAnswer !== null) {
            return multi ? new Set(currentAnswer) : currentAnswer;
        }
        return multi ? new Set() : null;
    });

    useEffect(() => {
        if (currentAnswer !== undefined && currentAnswer !== null) {
            setSelected(multi ? new Set(currentAnswer) : currentAnswer);
        } else {
            setSelected(multi ? new Set() : null);
        }
    }, [questionId, currentAnswer, multi]);

    const handleSelectionChange = (newSelected) => {
        if (disabled) return;
        setSelected(newSelected);

        if (multi) {
            const selectedArray = Array.from(newSelected);
            onAnswerChange(questionId, selectedArray);
        } else {
            onAnswerChange(questionId, newSelected);
        }
    };

    return (
        <article className={styles.option_list}>
            {options.map((o) => (
                <OptionSelect
                    key={o.id}
                    option={o}
                    multi={multi}
                    selected={selected}
                    setSelected={handleSelectionChange}
                />
            ))}
        </article>
    )
}