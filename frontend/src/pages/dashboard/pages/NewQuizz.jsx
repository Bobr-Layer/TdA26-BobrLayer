import styles from '../dashboard.module.scss';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import QuizzForm from '../quizzes/quizz-form/QuizzForm';
import { createQuiz } from '../../../services/QuizzService';

export default function NewQuizz({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid } = useParams();

    const [newQuizzData, setNewQuizzData] = useState({
        title: '',
        questions: [
            {
                type: 'singleChoice',
                question: '',
                options: ['', ''],
                correctIndex: 0,
            }
        ]
    });

    const handleNewQuizzChange = (e) => {
        const { name, value } = e.target;
        setNewQuizzData(prev => ({ ...prev, [name]: value }));
    };

    const handleNewQuestionChange = (questionIndex, value) => {
        setNewQuizzData(prev => {
            const questions = [...prev.questions];
            questions[questionIndex] = {
                ...questions[questionIndex],
                question: value,
            };
            return { ...prev, questions };
        });
    };

    const handleQuestionTypeChange = (questionIndex, isMultiple) => {
        setNewQuizzData(prev => {
            const questions = [...prev.questions];
            const newQuestion = {
                ...questions[questionIndex],
                type: isMultiple ? 'multipleChoice' : 'singleChoice',
            };

            if (isMultiple) {
                delete newQuestion.correctIndex;
                newQuestion.correctIndices = [];
            } else {
                delete newQuestion.correctIndices;
                newQuestion.correctIndex = 0;
            }

            questions[questionIndex] = newQuestion;
            return { ...prev, questions };
        });
    };

    const handleAnswerChange = (questionIndex, answerIndex, value) => {
        setNewQuizzData(prev => {
            const questions = [...prev.questions];
            const options = [...questions[questionIndex].options];
            options[answerIndex] = value;
            questions[questionIndex] = {
                ...questions[questionIndex],
                options,
            };
            return { ...prev, questions };
        });
    };

    const addAnswer = (questionIndex) => {
        setNewQuizzData(prev => {
            const questions = [...prev.questions];
            questions[questionIndex] = {
                ...questions[questionIndex],
                options: [...questions[questionIndex].options, ''],
            };
            return { ...prev, questions };
        });
    };

    const deleteAnswer = (questionIndex, answerIndex) => {
        setNewQuizzData(prev => {
            const questions = [...prev.questions];
            const options = questions[questionIndex].options.filter((_, i) => i !== answerIndex);

            let updates = {};

            if (questions[questionIndex].type === 'singleChoice') {
                let correctIndex = questions[questionIndex].correctIndex;
                if (correctIndex === answerIndex) correctIndex = 0;
                else if (correctIndex > answerIndex) correctIndex--;
                updates.correctIndex = correctIndex;
            } else {
                let correctIndices = questions[questionIndex].correctIndices || [];
                correctIndices = correctIndices
                    .filter(i => i !== answerIndex)
                    .map(i => i > answerIndex ? i - 1 : i);
                updates.correctIndices = correctIndices;
            }

            questions[questionIndex] = {
                ...questions[questionIndex],
                options,
                ...updates,
            };
            return { ...prev, questions };
        });
    };

    const setCorrectAnswer = (questionIndex, answerIndex) => {
        setNewQuizzData(prev => {
            const questions = [...prev.questions];
            const question = questions[questionIndex];

            if (question.type === 'singleChoice') {
                questions[questionIndex] = {
                    ...question,
                    correctIndex: answerIndex,
                };
            } else {
                let correctIndices = Array.isArray(question.correctIndices)
                    ? [...question.correctIndices]
                    : [];

                if (correctIndices.includes(answerIndex)) {
                    correctIndices = correctIndices.filter(i => i !== answerIndex);
                } else {
                    correctIndices.push(answerIndex);
                }

                questions[questionIndex] = {
                    ...question,
                    correctIndices: correctIndices,
                };
            }

            return { ...prev, questions };
        });
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        if (!newQuizzData.title.trim()) {
            alert('Vyplňte název kvízu');
            return;
        }

        for (let i = 0; i < newQuizzData.questions.length; i++) {
            const q = newQuizzData.questions[i];

            if (!q.question.trim()) {
                alert(`Vyplňte text otázky ${i + 1}`);
                return;
            }

            if (q.options.length < 2) {
                alert(`Otázka ${i + 1} musí mít alespoň 2 odpovědi`);
                return;
            }

            if (q.options.some(opt => !opt.trim())) {
                alert(`Všechny odpovědi v otázce ${i + 1} musí být vyplněné`);
                return;
            }

            if (q.type === 'multipleChoice') {
                if (!Array.isArray(q.correctIndices) || q.correctIndices.length === 0) {
                    alert(`U otázky ${i + 1} musíte označit alespoň jednu správnou odpověď`);
                    return;
                }
            } else {
                if (typeof q.correctIndex !== 'number' || q.correctIndex < 0 || q.correctIndex >= q.options.length) {
                    alert(`U otázky ${i + 1} musíte označit správnou odpověď`);
                    return;
                }
            }
        }

        try {
            await createQuiz(uuid, {
                title: newQuizzData.title,
                questions: newQuizzData.questions,
            });

            navigate('/dashboard/' + uuid);
        } catch (error) {
            console.error(error);
            alert('Nepodařilo se vytvořit kvíz');
        }
    };

    const deleteQuestion = (index) => {
        setNewQuizzData(prev => ({
            ...prev,
            questions: prev.questions.filter((_, i) => i !== index),
        }));
    };

    const addQuestion = () => {
        setNewQuizzData(prev => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    type: 'singleChoice',
                    question: '',
                    options: ['', ''],
                    correctIndex: 0,
                }
            ]
        }));
    };

    const actions = [
        {
            text: 'Uložit změny',
            icon: <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M25.1191 8.49406L11.1191 22.4941C11.0378 22.5754 10.9413 22.64 10.8351 22.684C10.7288 22.728 10.615 22.7507 10.5 22.7507C10.385 22.7507 10.2711 22.728 10.1649 22.684C10.0587 22.64 9.9622 22.5754 9.88094 22.4941L3.75594 16.3691C3.59175 16.2049 3.49951 15.9822 3.49951 15.75C3.49951 15.5178 3.59175 15.2951 3.75594 15.1309C3.92012 14.9667 4.1428 14.8745 4.375 14.8745C4.60719 14.8745 4.82988 14.9667 4.99406 15.1309L10.5 20.638L23.8809 7.25594C24.0451 7.09175 24.2678 6.99951 24.5 6.99951C24.7322 6.99951 24.9549 7.09175 25.1191 7.25594C25.2832 7.42012 25.3755 7.6428 25.3755 7.875C25.3755 8.10719 25.2832 8.32988 25.1191 8.49406Z" fill="white" />
            </svg>,
            onClick: (e) => onSubmit(e),
            red: false,
            submit: true
        },
        {
            text: 'Zrušit změny',
            icon: <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.4941 21.2559C22.5754 21.3372 22.6398 21.4337 22.6838 21.54C22.7278 21.6462 22.7505 21.76 22.7505 21.875C22.7505 21.99 22.7278 22.1038 22.6838 22.21C22.6398 22.3163 22.5754 22.4128 22.4941 22.4941C22.4128 22.5754 22.3163 22.6398 22.21 22.6838C22.1038 22.7278 21.99 22.7505 21.875 22.7505C21.76 22.7505 21.6462 22.7278 21.54 22.6838C21.4337 22.6398 21.3372 22.5754 21.2559 22.4941L14 15.237L6.74406 22.4941C6.57988 22.6582 6.35719 22.7505 6.125 22.7505C5.8928 22.7505 5.67012 22.6582 5.50594 22.4941C5.34175 22.3299 5.24951 22.1072 5.24951 21.875C5.24951 21.6428 5.34175 21.4201 5.50594 21.2559L12.763 14L5.50594 6.74406C5.34175 6.57988 5.24951 6.35719 5.24951 6.125C5.24951 5.8928 5.34175 5.67012 5.50594 5.50594C5.67012 5.34175 5.8928 5.24951 6.125 5.24951C6.35719 5.24951 6.57988 5.34175 6.74406 5.50594L14 12.763L21.2559 5.50594C21.4201 5.34175 21.6428 5.24951 21.875 5.24951C22.1072 5.24951 22.3299 5.34175 22.4941 5.50594C22.6582 5.67012 22.7505 5.8928 22.7505 6.125C22.7505 6.35719 22.6582 6.57988 22.4941 6.74406L15.237 14L22.4941 21.2559Z" fill="white" />
            </svg>,
            onClick: () => navigate('/dashboard/' + uuid),
            red: true
        }
    ]

    return (
        <div>
            <Sidenav user={user} setUser={setUser} />
            <section className={styles.dashboard}>
                <DashboardNav heading={'Nový kvíz'} actions={actions} />
                <QuizzForm
                    quizzData={newQuizzData}
                    handleQuizzChange={handleNewQuizzChange}
                    handleQuestionChange={handleNewQuestionChange}
                    handleQuestionTypeChange={handleQuestionTypeChange}
                    handleAnswerChange={handleAnswerChange}
                    addAnswer={addAnswer}
                    deleteAnswer={deleteAnswer}
                    setCorrectAnswer={setCorrectAnswer}
                    onSubmit={onSubmit}
                    deleteQuestion={deleteQuestion}
                    addQuestion={addQuestion}
                />
            </section>
        </div>
    )
}