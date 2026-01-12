import styles from './quiz.module.scss';
import Header from '../../../shared/layout/header/Header';
import { useState } from 'react';
import QuizQuestion from './quiz-question/QuizQuestion';
import { useParams } from 'react-router-dom';
import QuizResults from './quiz-results/QuizResults';

export default function Quiz() {
    const { uuid } = useParams();

    const [currentStep, setCurrentStep] = useState(0);
    const [finish, setFinish] = useState(false);
    const steps = [
        { id: 0, question: 'quiz.question Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?', options: [{ id: 0, option: 'prvni moznost' }, { id: 1, option: 'driha moznost' }, { id: 2, option: 'treti moznost' }], multi: true },
        { id: 1, question: 'quiz.question Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?', options: [{ id: 0, option: 'prvni moznost' }, { id: 1, option: 'driha moznost' }, { id: 2, option: 'treti moznost' }], multi: false },
        { id: 2, question: 'quiz.question Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?', options: [{ id: 0, option: 'prvni moznost' }, { id: 1, option: 'driha moznost' }, { id: 2, option: 'treti moznost' }], multi: true },
        { id: 3, question: 'quiz.question Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua?', options: [{ id: 0, option: 'prvni moznost' }, { id: 1, option: 'driha moznost' }, { id: 2, option: 'treti moznost' }], multi: false }
    ]

    const [answers, setAnswers] = useState([]);

    const handleAnswerChange = (questionId, answer) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionId] = answer;
            return newAnswers;
        });
    };

    return (
        <div className={styles.quiz}>
            <Header green={true} />
            {finish ? (
                <QuizResults name={'nazev kvizu'} answers={answers} uuid={uuid}/>
            ) : (
                <QuizQuestion
                    quiz={steps[currentStep]}
                    currentStep={currentStep}
                    setCurrentStep={setCurrentStep}
                    name={'nazev kvizu'}
                    length={steps.length}
                    currentAnswer={answers[currentStep]}
                    onAnswerChange={handleAnswerChange}
                    uuid={uuid}
                    setFinish={setFinish}
                />
            )}
        </div>
    )
}