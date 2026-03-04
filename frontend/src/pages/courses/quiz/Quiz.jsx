import styles from './quiz.module.scss';
import { useState, useEffect, useCallback } from 'react';
import QuizQuestion from './quiz-question/QuizQuestion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import QuizResults from './quiz-results/QuizResults';
import { getQuizByUuid, submitQuiz } from '../../../services/QuizzService';

export default function Quiz() {
    const navigate = useNavigate();
    const { uuid, moduleUuid, quizzUuid } = useParams();
    const [quiz, setQuiz] = useState();
    const [loading, setLoading] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [finish, setFinish] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [answers, setAnswers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [quizResult, setQuizResult] = useState(null);

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                const data = await getQuizByUuid(uuid, moduleUuid, quizzUuid);
                setQuiz(data);
            } catch (err) {
                console.error(err);
                navigate('/courses/' + uuid + '/modules/' + moduleUuid)
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

            const result = await submitQuiz(uuid, moduleUuid, quizzUuid, submitData);

            console.log(result);
            setQuizResult(result);
            setFinish(true);
            setShowResults(false);
        } catch (err) {
            console.error('Chyba při odesílání kvízu:', err);
            alert('Nepodařilo se odeslat kvíz. Zkuste to prosím znovu.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className={styles.quiz}>
            <Link to={'/courses/' + uuid} className={styles.quiz_header}>
                <svg width="2.5rem" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M35 20C35 20.3315 34.8683 20.6494 34.6339 20.8838C34.3995 21.1183 34.0815 21.25 33.75 21.25H9.26719L18.3844 30.3656C18.5005 30.4817 18.5926 30.6196 18.6555 30.7713C18.7184 30.9231 18.7507 31.0857 18.7507 31.25C18.7507 31.4142 18.7184 31.5768 18.6555 31.7286C18.5926 31.8803 18.5005 32.0182 18.3844 32.1343C18.2682 32.2505 18.1304 32.3426 17.9786 32.4055C17.8269 32.4683 17.6643 32.5007 17.5 32.5007C17.3358 32.5007 17.1731 32.4683 17.0214 32.4055C16.8696 32.3426 16.7318 32.2505 16.6156 32.1343L5.36563 20.8843C5.24941 20.7682 5.15721 20.6304 5.09431 20.4786C5.0314 20.3269 4.99902 20.1642 4.99902 20C4.99902 19.8357 5.0314 19.673 5.09431 19.5213C5.15721 19.3695 5.24941 19.2317 5.36563 19.1156L16.6156 7.86559C16.8502 7.63104 17.1683 7.49927 17.5 7.49927C17.8317 7.49927 18.1498 7.63104 18.3844 7.86559C18.6189 8.10014 18.7507 8.41826 18.7507 8.74996C18.7507 9.08167 18.6189 9.39979 18.3844 9.63434L9.26719 18.75H33.75C34.0815 18.75 34.3995 18.8817 34.6339 19.1161C34.8683 19.3505 35 19.6684 35 20Z" fill="white" />
                </svg>
                Vrátit se zpět na kurz
            </Link>
            {quiz && (
                <>
                    {finish ? (
                        <>
                            {showResults ? (
                                <QuizQuestion
                                    quiz={quiz}
                                    currentStep={currentStep}
                                    setCurrentStep={setCurrentStep}
                                    name={quiz.title}
                                    length={quiz.questions.length}
                                    currentAnswer={answers[currentStep]}
                                    onAnswerChange={handleAnswerChange}
                                    uuid={uuid}
                                    onSubmit={handleSubmitQuiz}
                                    submitting={submitting}
                                    currentQuestion={quiz.questions[currentStep]}
                                    quizResult={quizResult}
                                />
                            ) : (
                                <QuizResults
                                    name={quiz.title}
                                    result={quizResult}
                                    setShowResults={setShowResults}
                                />
                            )}
                        </>
                    ) : (
                        <QuizQuestion
                            quiz={quiz}
                            currentStep={currentStep}
                            setCurrentStep={setCurrentStep}
                            name={quiz.title}
                            length={quiz.questions.length}
                            currentAnswer={answers[currentStep]}
                            onAnswerChange={handleAnswerChange}
                            uuid={uuid}
                            onSubmit={handleSubmitQuiz}
                            submitting={submitting}
                            currentQuestion={quiz.questions[currentStep]}
                            info={true}
                        />
                    )}
                </>
            )}
            <div className={styles.quiz_ball}></div>
        </div>
    )
}