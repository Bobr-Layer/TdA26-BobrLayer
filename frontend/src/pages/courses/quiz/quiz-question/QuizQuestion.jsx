import ResultCard from '../quiz-results/result-card/ResultCard';
import OptionList from './option-list/OptionList';
import styles from './quiz-question.module.scss';

function OpenAnswerInput({ questionId, currentAnswer, onAnswerChange, disabled }) {
    return (
        <div className={styles.open_answer}>
            <textarea
                className={styles.open_answer_input}
                value={currentAnswer || ''}
                onChange={e => !disabled && onAnswerChange(questionId, e.target.value)}
                disabled={disabled}
                placeholder="Napište svou odpověď..."
                rows={4}
            />
        </div>
    );
}

export default function QuizQuestion({
    quiz,
    currentStep,
    setCurrentStep,
    length,
    currentAnswer,
    onAnswerChange,
    onSubmit,
    currentQuestion,
    info,
    quizResult,
    submitting
}) {
    const isOpen = currentQuestion.type === 'openQuestion';
    const isMulti = currentQuestion.type === 'multipleChoice';
    const isLastStep = currentStep >= length - 1;

    return (
        <section className={styles.quiz_question}>
            {/* Horizontal progress strip */}
            <div className={styles.quiz_progress}>
                {quiz.questions.map((q, index) => (
                    <ResultCard
                        key={index}
                        number={index + 1}
                        info={info}
                        onClick={() => setCurrentStep(index)}
                        active={currentStep === index}
                        correct={quizResult?.correctPerQuestion?.[index]}
                        open={quizResult?.correctPerQuestion?.[index] == null && !info}
                    />
                ))}
            </div>

            <div className={styles.quiz_question_content}>
                <div className={styles.quiz_question_content_top}>
                    <span className={styles.question_type_label}>
                        {isOpen ? 'Otevřená otázka' : isMulti ? 'Více správných odpovědí' : 'Jedna správná odpověď'}
                    </span>
                    <h1>{currentQuestion.question}</h1>
                </div>

                {isOpen ? (
                    <OpenAnswerInput
                        questionId={currentStep}
                        currentAnswer={currentAnswer}
                        onAnswerChange={onAnswerChange}
                        disabled={!info}
                    />
                ) : (
                    <OptionList
                        multi={isMulti}
                        options={(currentQuestion.options || []).map((opt, index) => ({ id: index, option: opt }))}
                        questionId={currentStep}
                        currentAnswer={currentAnswer}
                        onAnswerChange={onAnswerChange}
                        disabled={!info}
                        correctAnswer={isMulti ? currentQuestion.correctIndices : currentQuestion.correctIndex}
                    />
                )}

                <div className={styles.quiz_question_content_nav}>
                    {currentStep !== 0 ? (
                        <button className={`${styles.prev}`} onClick={() => setCurrentStep(currentStep - 1)}>
                            <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M35 20C35 20.3315 34.8683 20.6494 34.6339 20.8838C34.3995 21.1183 34.0815 21.25 33.75 21.25H9.26719L18.3844 30.3656C18.619 30.6002 18.7507 30.9183 18.7507 31.25C18.7507 31.5817 18.619 31.8998 18.3844 32.1344C18.1499 32.3689 17.8317 32.5007 17.5 32.5007C17.1683 32.5007 16.8502 32.3689 16.6156 32.1344L5.36563 20.8844C5.24941 20.7682 5.15721 20.6304 5.09431 20.4786C5.0314 20.3269 4.99902 20.1642 4.99902 20C4.99902 19.8357 5.0314 19.673 5.09431 19.5213C5.15721 19.3695 5.24941 19.2317 5.36563 19.1156L16.6156 7.86563C16.8502 7.63108 17.1683 7.49931 17.5 7.49931C17.8317 7.49931 18.1499 7.63108 18.3844 7.86563C18.619 8.10018 18.7507 8.4183 18.7507 8.75C18.7507 9.0817 18.619 9.39982 18.3844 9.63437L9.26719 18.75H33.75C34.0815 18.75 34.3995 18.8817 34.6339 19.1161C34.8683 19.3505 35 19.6685 35 20Z" fill="currentColor"/>
                            </svg>
                            Předchozí
                        </button>
                    ) : (
                        <span />
                    )}

                    {!(!info && isLastStep) && (
                        <button
                            className={isLastStep && info ? styles.submit : styles.next}
                            onClick={() => isLastStep ? onSubmit() : setCurrentStep(currentStep + 1)}
                            disabled={submitting}
                        >
                            {isLastStep ? 'Odeslat kvíz' : 'Následující'}
                            {!isLastStep && (
                                <svg width="16" height="16" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M34.6344 20.8844L23.3844 32.1344C23.1499 32.3689 22.8317 32.5007 22.5 32.5007C22.1683 32.5007 21.8502 32.3689 21.6156 32.1344C21.381 31.8998 21.2493 31.5817 21.2493 31.25C21.2493 30.9183 21.381 30.6002 21.6156 30.3656L30.7328 21.25H6.25C5.91848 21.25 5.60054 21.1183 5.36612 20.8839C5.1317 20.6495 5 20.3315 5 20C5 19.6685 5.1317 19.3505 5.36612 19.1161C5.60054 18.8817 5.91848 18.75 6.25 18.75H30.7328L21.6156 9.63438C21.381 9.39983 21.2493 9.08171 21.2493 8.75001C21.2493 8.41831 21.381 8.10019 21.6156 7.86564C21.8502 7.63109 22.1683 7.49932 22.5 7.49932C22.8317 7.49932 23.1499 7.63109 23.3844 7.86564L34.6344 19.1156C34.7506 19.2318 34.8428 19.3696 34.9057 19.5214C34.9686 19.6731 35.001 19.8358 35.001 20C35.001 20.1643 34.9686 20.3269 34.9057 20.4787C34.8428 20.6304 34.7506 20.7683 34.6344 20.8844Z" fill="currentColor"/>
                                </svg>
                            )}
                        </button>
                    )}
                </div>
            </div>
        </section>
    );
}
