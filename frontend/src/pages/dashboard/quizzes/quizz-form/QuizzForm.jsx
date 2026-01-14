import styles from './quizz-form.module.scss';
import Input from '../../../../shared/form/input/Input';
import QuestionInput from '../../../../shared/form/question-input/QuestionInput';
import NewButton from '../../../../shared/button/new/NewButton'

export default function QuizzForm({
    quizzData,
    handleQuizzChange,
    handleQuestionChange,
    handleQuestionTypeChange,
    handleAnswerChange,
    addAnswer,
    deleteAnswer,
    setCorrectAnswer,
    onSubmit,
    deleteQuestion,
    addQuestion
}) {
    return (
        <form className={styles.quizz_form} onSubmit={onSubmit}>
            <div className={styles.quizz_form_content}>
                <Input
                    name="title"
                    placeholder="Název kvízu"
                    value={quizzData.title}
                    onChange={handleQuizzChange}
                    title={true}
                />
            </div>
            <div className={styles.quizz_form_content}>
                <h3>Otázky</h3>
                <div className={styles.quizz_form_content_list}>
                    {quizzData.questions?.map((q, index) => (
                        <QuestionInput
                            key={index}
                            question={q}
                            questionIndex={index}
                            value={q.question}
                            placeholder={`Otázka ${index + 1}`}
                            onChange={(e) => handleQuestionChange(index, e.target.value)}
                            onDelete={() => deleteQuestion(index)}
                            onTypeChange={(isMultiple) => handleQuestionTypeChange(index, isMultiple)}
                            onAnswerChange={(answerIndex, value) => handleAnswerChange(index, answerIndex, value)}
                            onAddAnswer={() => addAnswer(index)}
                            onDeleteAnswer={(answerIndex) => deleteAnswer(index, answerIndex)}
                            onSetCorrectAnswer={(answerIndex) => setCorrectAnswer(index, answerIndex)}
                        />
                    ))}
                    <NewButton onClick={addQuestion} />
                </div>
            </div>
        </form>
    )
}