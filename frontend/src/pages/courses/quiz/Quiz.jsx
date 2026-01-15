import styles from './quiz.module.scss';
import Header from '../../../shared/layout/header/Header';
import { useState, useEffect, useCallback } from 'react';
import QuizQuestion from './quiz-question/QuizQuestion';
import { useParams, useNavigate } from 'react-router-dom';
import QuizResults from './quiz-results/QuizResults';
import { getQuizByUuid, submitQuiz } from '../../../services/QuizzService';

export default function Quiz() {
    const navigate = useNavigate();
    const { uuid, quizzUuid } = useParams();
    const [quiz, setQuiz] = useState();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [finish, setFinish] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                const data = await getQuizByUuid(uuid, quizzUuid);
                setQuiz(data);
            } catch (err) {
                console.error(err);
                navigate('/courses/' + uuid)
            } finally {
                setLoading(false);
            }
        };

        loadQuiz();
    }, [uuid, quizzUuid, navigate]);

    const handleAnswerChange = useCallback((questionId, answer) => {
        setAnswers(prev => {
            const newAnswers = [...prev];
            newAnswers[questionId] = answer;
            return newAnswers;
        });
    }, []);

    const handleSubmitQuiz = async () => {
        if (submitting) return;

        setSubmitting(true);

        try {
            const submitData = {
                answers: quiz.questions.map((question, index) => {
                    const answer = answers[index];
                    const answerObj = {
                        uuid: question.uuid
                    };

                    if (question.type === 'singleChoice') {
                        answerObj.selectedIndex = answer !== null && answer !== undefined ? answer : null;
                    }
                    else if (question.type === 'multipleChoice') {
                        if (Array.isArray(answer) && answer.length > 0) {
                            answerObj.selectedIndices = answer;
                        } else {
                            answerObj.selectedIndices = [];
                        }
                    }

                    return answerObj;
                })
            };

            const result = await submitQuiz(uuid, quizzUuid, submitData);

            setQuizResult(result);
            setFinish(true);
        } catch (err) {
            console.error('Chyba při odesílání kvízu:', err);
            alert('Nepodařilo se odeslat kvíz. Zkuste to prosím znovu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.quiz}>
            <Header green={true} />
            {quiz && (
                <>
                    {finish ? (
                        <QuizResults
                            name={quiz.title}
                            uuid={uuid}
                            result={quizResult}
                        />
                    ) : (
                        <QuizQuestion
                            quiz={quiz.questions[currentStep]}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            name={quiz.title}
                            length={quiz.questions.length}
                            currentAnswer={answers[currentStep]}
                            onAnswerChange={handleAnswerChange}
                            uuid={uuid}
                            onSubmit={handleSubmitQuiz}
                            submitting={submitting}
                        />
                    )}
                </>
            )}
        </div>
    )
}