import { useState, useEffect } from 'react';
import styles from './option-list.module.scss';
import OptionSelect from './option-select/OptionSelect';
import QuizButton from '../../../../../shared/button/quiz/QuizButton';

export default function OptionList({ multi, options, questionId, currentAnswer, onAnswerChange, uuid, setFinish }) {
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
    }, [questionId]);

    useEffect(() => {
        if (selected !== null && (multi ? selected.size > 0 : true)) {
            if (multi) {
                onAnswerChange(questionId, Array.from(selected));
            } else {
                onAnswerChange(questionId, selected);
            }
        }
    }, [selected, questionId, multi, onAnswerChange]);

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
                        setSelected={setSelected}
                    />
                ))}
            </div>
            <div className={styles.option_list_buttons}>
                <QuizButton text={'Smazat odpověď'} red={true} link={'/courses/' + uuid}/>
                <QuizButton text={'Pokračovat'} onClick={() => setFinish(true)}/>
            </div>
        </article>
    )
}