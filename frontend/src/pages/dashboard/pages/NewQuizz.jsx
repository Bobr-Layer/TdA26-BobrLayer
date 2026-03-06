import styles from '../dashboard.module.scss';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Sidenav from '../../../shared/layout/sidenav/Sidenav';
import DashboardNav from '../../../shared/layout/dashboard-nav/DashboardNav';
import QuizzForm from '../quizzes/quizz-form/QuizzForm';
import { createQuiz } from '../../../services/QuizzService';
import Header from '../../../shared/layout/header/Header';

export default function NewQuizz({ user, setUser }) {
    const navigate = useNavigate();
    const { uuid, moduleUuid } = useParams();

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

            let correctIndices = Array.isArray(question.correctIndices)
                ? [...question.correctIndices]
                : question.correctIndex !== undefined
                    ? [question.correctIndex]
                    : [];

            if (correctIndices.includes(answerIndex)) {
                correctIndices = correctIndices.filter(i => i !== answerIndex);
            } else {
                correctIndices.push(answerIndex);
            }

            const isMultiple = correctIndices.length > 1;

            questions[questionIndex] = {
                ...question,
                type: isMultiple ? 'multipleChoice' : 'singleChoice',
                correctIndices: isMultiple ? correctIndices : undefined,
                correctIndex: !isMultiple ? (correctIndices[0] ?? 0) : undefined,
            };

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
            await createQuiz(uuid, moduleUuid, {
                title: newQuizzData.title,
                questions: newQuizzData.questions,
            });

            navigate('/dashboard/' + uuid + '/modules/' + moduleUuid);
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

    return (
        <div>
            <Header user={user} setUser={setUser} onlyMobile={true}/>
            <Sidenav user={user} setUser={setUser} showMore={true} current={'courseModule_{uuid}'} />
            <form className={styles.dashboard} onSubmit={onSubmit}>
                <DashboardNav
                    link={'/dashboard/' + uuid + '/modules/' + moduleUuid}
                    textLink={'Vrátit se zpět a zahodit změny'}
                    buttonText={'Uložit změny'}
                    buttonIcon={
                        <svg width="1.75rem" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M25.1196 8.49406L11.1195 22.4941C11.0383 22.5754 10.9418 22.64 10.8356 22.684C10.7293 22.728 10.6155 22.7507 10.5005 22.7507C10.3855 22.7507 10.2716 22.728 10.1654 22.684C10.0592 22.64 9.96269 22.5754 9.88142 22.4941L3.75642 16.3691C3.59224 16.2049 3.5 15.9822 3.5 15.75C3.5 15.5178 3.59224 15.2951 3.75642 15.1309C3.92061 14.9667 4.14329 14.8745 4.37549 14.8745C4.60768 14.8745 4.83036 14.9667 4.99455 15.1309L10.5005 20.638L23.8814 7.25594C24.0456 7.09175 24.2683 6.99951 24.5005 6.99951C24.7327 6.99951 24.9554 7.09175 25.1196 7.25594C25.2837 7.42012 25.376 7.6428 25.376 7.875C25.376 8.10719 25.2837 8.32988 25.1196 8.49406Z" fill="#1A1A1A" />
                        </svg>
                    }
                    buttonSubmit={true}
                    showButton={true}
                />
                <QuizzForm
                    quizzData={newQuizzData}
                    handleQuizzChange={handleNewQuizzChange}
                    handleQuestionChange={handleNewQuestionChange}
                    handleAnswerChange={handleAnswerChange}
                    addAnswer={addAnswer}
                    deleteAnswer={deleteAnswer}
                    setCorrectAnswer={setCorrectAnswer}
                    deleteQuestion={deleteQuestion}
                    addQuestion={addQuestion}
                />
            </form>
        </div>
    )
}