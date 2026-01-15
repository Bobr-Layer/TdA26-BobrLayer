import { useState, useEffect } from 'react';
import styles from './option-list.module.scss';
import OptionSelect from './option-select/OptionSelect';
import QuizButton from '../../../../../shared/button/quiz/QuizButton';

export default function OptionList({ 
    multi, 
    options, 
    questionId, 
    currentAnswer, 
    onAnswerChange, 
    uuid, 
    onSubmit,
    submitting,
    isLastQuestion 
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
        setSelected(newSelected);
        
        if (multi) {
            const selectedArray = Array.from(newSelected);
            onAnswerChange(questionId, selectedArray);
        } else {
            onAnswerChange(questionId, newSelected);
        }
    };

    const handleSubmit = () => {
        if (!submitting && isLastQuestion) {
            onSubmit();
        }
    };

    return (
        <article className={styles.option_list}>
            <h3>{multi ? ('Vyberte správné odpovědi') : ('Vyberte jednu odpověď')}</h3>
            <div className={styles.option_list_options}>
                {options.map((o) => (
                    <OptionSelect 
                        key={o.id}
                        option={o} 
                        multi={multi}
                        selected={selected}
                        setSelected={handleSelectionChange}
                    />
                ))}
            </div>
            <div className={styles.option_list_buttons}>
                <QuizButton text={'Smazat odpověď'} red={true} link={'/courses/' + uuid}/>
                {isLastQuestion ? (
                    <QuizButton 
                        text={submitting ? 'Odesílám...' : 'Odeslat kvíz'} 
                        onClick={handleSubmit}
                        disabled={submitting}
                    />
                ) : (
                    <QuizButton text={'Pokračovat'} />
                )}
            </div>
        </article>
    )
}