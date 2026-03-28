import { useState } from 'react';
import styles from './quizz-detail.module.scss';
import ResultCard from './result-card/ResultCard';

export default function QuizzDetail({ quiz, attempts = [] }) {
  const questionsCount = quiz.questions.length;
  const gradableQuestions = quiz.questions.filter(q => q.type !== 'openQuestion');
  const averageScore = gradableQuestions.length > 0
    ? gradableQuestions.reduce((sum, q) => sum + (q.successRate ?? 0), 0) / gradableQuestions.length
    : 0;

  return (
    <article className={styles.quizz_detail}>
      <div className={styles.quizz_detail_info}>
        <div className={styles.quizz_detail_info_header}>
          <h2>{quiz.title}</h2>
        </div>
        <div className={styles.quizz_detail_content}>
          <h3>Otázky</h3>
          <div className={styles.quizz_detail_content_question}>
            {quiz.questions.map((q) => (
              <QuestionCard key={q.uuid} question={q} />
            ))}
          </div>
        </div>
      </div>
      <div className={styles.quizz_detail_results}>
        <div className={styles.quizz_detail_content_res}>
          <h3>Průměrný výsledek</h3>
          <div className={styles.quizz_detail_content_result}>
            <ResultCard
              averageScore={averageScore}
              questionsCount={questionsCount}
              attemptsCount={quiz.attemptsCount}
              questions={quiz.questions}
            />
          </div>
        </div>
        <div className={styles.quizz_detail_attempts_section}>
          <h3>Pokusy studentů ({attempts.length})</h3>
          {attempts.length === 0 ? (
            <p className={styles.no_attempts}>Zatím žádné pokusy</p>
          ) : (
            <div className={styles.attempts_list}>
              {attempts.map(attempt => (
                <AttemptCard key={attempt.uuid} attempt={attempt} quiz={quiz} />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function AttemptCard({ attempt, quiz }) {
  const [open, setOpen] = useState(false);
  const gradable = (attempt.correctPerQuestion || []).filter(x => x !== null && x !== undefined);
  const correct = gradable.filter(Boolean).length;

  return (
    <div className={styles.attempt_card} onClick={() => setOpen(!open)}>
      <div className={styles.attempt_card_header}>
        <span className={styles.attempt_student}>{attempt.studentUsername}</span>
        <span className={styles.attempt_score}>{correct}/{gradable.length}</span>
        <span className={styles.attempt_date}>{new Date(attempt.submittedAt).toLocaleString('cs-CZ')}</span>
      </div>
      {open && (
        <div className={styles.attempt_detail}>
          {(attempt.correctPerQuestion || []).map((isCorrect, i) => {
            const question = quiz.questions[i];
            const isOpenQ = isCorrect === null || isCorrect === undefined;
            return (
              <div key={i} className={`${styles.attempt_question} ${isOpenQ ? styles.open : isCorrect ? styles.correct : styles.wrong}`}>
                <span className={styles.attempt_q_num}>{i + 1}.</span>
                <span className={styles.attempt_q_text}>{question?.question}</span>
                {isOpenQ && attempt.textAnswers?.[question?.uuid] && (
                  <span className={styles.attempt_text_answer}>„{attempt.textAnswers[question.uuid]}"</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question }) {
  const [showMore, setShowMore] = useState(false);
  const isOpen = question.type === 'openQuestion';

  return (
    <div className={styles.question_card} onClick={() => setShowMore(!showMore)}>
      <div className={styles.question_card_header}>
        <h4>{question.question}</h4>
        <svg width="1.25rem" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${showMore ? styles.show : ''}`}>
          <path d="M16.6925 7.94217L10.4425 14.1922C10.3845 14.2503 10.3156 14.2964 10.2397 14.3278C10.1638 14.3593 10.0825 14.3755 10.0003 14.3755C9.91821 14.3755 9.83688 14.3593 9.76101 14.3278C9.68514 14.2964 9.61621 14.2503 9.55816 14.1922L3.30816 7.94217C3.19088 7.82489 3.125 7.66583 3.125 7.49998C3.125 7.33413 3.19088 7.17507 3.30816 7.05779C3.42544 6.94052 3.5845 6.87463 3.75035 6.87463C3.9162 6.87463 4.07526 6.94052 4.19253 7.05779L10.0003 12.8664L15.8082 7.05779C15.8662 6.99972 15.9352 6.95366 16.011 6.92224C16.0869 6.89081 16.1682 6.87463 16.2503 6.87463C16.3325 6.87463 16.4138 6.89081 16.4897 6.92224C16.5655 6.95366 16.6345 6.99972 16.6925 7.05779C16.7506 7.11586 16.7967 7.1848 16.8281 7.26067C16.8595 7.33654 16.8757 7.41786 16.8757 7.49998C16.8757 7.5821 16.8595 7.66342 16.8281 7.73929C16.7967 7.81516 16.7506 7.8841 16.6925 7.94217Z" fill="white" />
        </svg>
      </div>
      {showMore && (
        <div className={styles.question_card_content}>
          {isOpen ? (
            question.correctAnswer
              ? <p className={styles.correct_answer_hint}>Vzorová odpověď: {question.correctAnswer}</p>
              : <p className={styles.open_hint}>Otevřená otázka bez vzorové odpovědi</p>
          ) : (
            (question.options || []).map((o, i) => (
              <p key={i}>{o}</p>
            ))
          )}
        </div>
      )}
    </div>
  );
}