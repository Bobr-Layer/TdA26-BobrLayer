package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizResultDTO;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;

import java.util.List;
import java.util.UUID;

public interface IQuizService {
    List<Quiz> find(UUID moduleUuid);
    Quiz find(UUID moduleUuid, UUID quizUuid);
    Quiz update(UUID moduleUuid, UUID quizUuid, QuizRequestDTO dto);
    Quiz create(UUID moduleUuid, QuizRequestDTO dto);
    void kill(UUID moduleUuid, UUID quizUuid);

    SubmitQuizResultDTO submitQuiz(UUID moduleUuid, UUID quizUuid, SubmitQuizDTO submission);
}
