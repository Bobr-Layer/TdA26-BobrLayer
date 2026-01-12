import styles from './quizz-form.module.scss';
import Input from '../../../../shared/form/input/Input';
import Textarea from '../../../../shared/form/textarea/Textarea';
import QuestionInput from '../../../../shared/form/question-input/QuestionInput';

export default function QuizzForm({ quizzData, handleQuizzChange, onSubmit }) {
    return (
        <article className={styles.quizz_form}>
            <form action="" onSubmit={onSubmit} className={styles.quizz_form_content}>
                <Input
                    name="name"
                    placeholder="Název kvízu"
                    value={quizzData.name}
                    onChange={handleQuizzChange}
                    title={true}
                />
                <Textarea
                    name="description"
                    placeholder="Krátký popis kvízu"
                    value={quizzData.description}
                    onChange={handleQuizzChange}
                    bigger={true}
                />
            </form>
            <div className={styles.quizz_form_content}>
                <h3>Otázky</h3>
                <div className={styles.quizz_form_content_list}>
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                    <QuestionInput name={'question'} placeholder={'quizz.question'} />
                </div>
            </div>
        </article>
    )
}
