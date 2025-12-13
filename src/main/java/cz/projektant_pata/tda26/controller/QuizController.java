package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.QuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.MultipleChoiceQuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SingleChoiceQuestionResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizDTO;
import cz.projektant_pata.tda26.model.course.quiz.MultipleChoiceQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.SingleChoiceQuestion;
import cz.projektant_pata.tda26.service.IQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses/{courseUuid}/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final IQuizService quizService;

    @GetMapping
    public ResponseEntity<List<QuizResponseDTO>> getAllQuizzes(@PathVariable UUID courseUuid) {
        List<Quiz> quizzes = quizService.find(courseUuid);
        List<QuizResponseDTO> response = quizzes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<QuizResponseDTO> createQuiz(
            @PathVariable UUID courseUuid,
            @RequestBody @Valid QuizRequestDTO request) {
        Quiz createdQuiz = quizService.create(courseUuid, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mapToResponse(createdQuiz));
    }

    @GetMapping("/{quizUuid}")
    public ResponseEntity<QuizResponseDTO> getQuiz(
            @PathVariable UUID courseUuid,
            @PathVariable UUID quizUuid) {
        Quiz quiz = quizService.find(courseUuid, quizUuid);
        return ResponseEntity.ok(mapToResponse(quiz));
    }

    @PutMapping("/{quizUuid}")
    public ResponseEntity<QuizResponseDTO> updateQuiz(
            @PathVariable UUID courseUuid,
            @PathVariable UUID quizUuid,
            @RequestBody @Valid QuizRequestDTO request) {
        Quiz updatedQuiz = quizService.update(courseUuid, quizUuid, request);
        return ResponseEntity.ok(mapToResponse(updatedQuiz));
    }

    @DeleteMapping("/{quizUuid}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteQuiz(
            @PathVariable UUID courseUuid,
            @PathVariable UUID quizUuid) {
        quizService.kill(courseUuid, quizUuid);
    }

    @PostMapping("/{quizUuid}/submit")
    public ResponseEntity<Double> submitQuiz(
            @PathVariable UUID courseUuid,
            @PathVariable UUID quizUuid,
            @RequestBody @Valid SubmitQuizDTO submission) {

        Double score = quizService.submitQuiz(courseUuid, quizUuid, submission);
        return ResponseEntity.ok(score);
    }


    private QuizResponseDTO mapToResponse(Quiz quiz) {
        QuizResponseDTO dto = new QuizResponseDTO();
        dto.setUuid(quiz.getUuid());
        dto.setTitle(quiz.getTitle());
        dto.setAttemptsCount(quiz.getAttemptsCount());

        List<QuestionResponseDTO> questions = quiz.getQuestions().stream()
                .map(this::mapQuestionToResponse)
                .collect(Collectors.toList());
        dto.setQuestions(questions);

        return dto;
    }

    private QuestionResponseDTO mapQuestionToResponse(Question q) {
        if (q instanceof SingleChoiceQuestion sq) {
            SingleChoiceQuestionResponseDTO dto = new SingleChoiceQuestionResponseDTO();
            fillCommonFields(dto, sq);
            dto.setCorrectIndex(sq.getCorrectIndex());
            dto.setType("singleChoice");
            return dto;

        } else if (q instanceof MultipleChoiceQuestion mq) {
            MultipleChoiceQuestionResponseDTO dto = new MultipleChoiceQuestionResponseDTO();
            fillCommonFields(dto, mq);
            dto.setCorrectIndices(mq.getCorrectIndices());
            dto.setType("multipleChoice");
            return dto;
        }
        throw new IllegalStateException("Unknown question type: " + q.getClass());
    }

    private void fillCommonFields(QuestionResponseDTO dto, Question q) {
        dto.setUuid(q.getUuid());
        dto.setQuestion(q.getQuestion());
        dto.setOptions(q.getOptions());
        dto.setSuccessRate(q.getSuccessRate());
    }
}
