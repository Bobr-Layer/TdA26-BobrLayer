package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizResultDTO;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;

import java.util.List;
import java.util.UUID;

public interface IQuizService {
    List<Quiz> find(UUID courseUuid);
    Quiz find(UUID courseUuid, UUID quizUuid);
    Quiz update(UUID courseUuid, UUID quizUuid, QuizRequestDTO dto);
    Quiz create(UUID courseUuid, QuizRequestDTO dto);
    void kill(UUID courseUuid, UUID quizUuid);

    SubmitQuizResultDTO submitQuiz(UUID courseUuid, UUID quizUuid, SubmitQuizDTO submission);
}
