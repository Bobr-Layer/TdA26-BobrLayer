package cz.projektant_pata.tda26.controller;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.projektant_pata.tda26.dto.course.quiz.EvaluateAttemptDTO;
import cz.projektant_pata.tda26.dto.course.quiz.OpenQuestionEvaluationDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizAttemptResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizResultDTO;
import cz.projektant_pata.tda26.mapper.QuizMapper;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.model.course.quiz.QuizAttempt;
import cz.projektant_pata.tda26.service.IQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseUuid}/modules/{moduleUuid}/quizzes")
@RequiredArgsConstructor
public class QuizController {

    private final IQuizService quizService;
    private final QuizMapper quizMapper;
    private final ObjectMapper objectMapper;

    @GetMapping
    public ResponseEntity<List<QuizResponseDTO>> find(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid  // ✅ přidáno
    ) {
        List<QuizResponseDTO> response = quizService.find(moduleUuid).stream() // ✅ bylo: courseUuid
                .map(quizMapper::toResponse)
                .toList();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{quizUuid}")
    public ResponseEntity<QuizResponseDTO> find(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID quizUuid
    ) {
        Quiz quiz = quizService.find(moduleUuid, quizUuid); // ✅ bylo: courseUuid
        return ResponseEntity.ok(quizMapper.toResponse(quiz));
    }

    @PostMapping
    public ResponseEntity<QuizResponseDTO> create(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @RequestBody @Valid QuizRequestDTO request
    ) {
        Quiz created = quizService.create(moduleUuid, request); // ✅ bylo: courseUuid
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(quizMapper.toResponse(created));
    }

    @PutMapping("/{quizUuid}")
    public ResponseEntity<QuizResponseDTO> update(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID quizUuid,
            @RequestBody @Valid QuizRequestDTO request
    ) {
        Quiz updated = quizService.update(moduleUuid, quizUuid, request); // ✅ bylo: courseUuid
        return ResponseEntity.ok(quizMapper.toResponse(updated));
    }

    @DeleteMapping("/{quizUuid}")
    public ResponseEntity<Void> kill(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID quizUuid
    ) {
        quizService.kill(moduleUuid, quizUuid); // ✅ bylo: courseUuid
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{quizUuid}/submit")
    public ResponseEntity<SubmitQuizResultDTO> submit(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,
            @PathVariable UUID quizUuid,
            @RequestBody @Valid SubmitQuizDTO submission
    ) {
        SubmitQuizResultDTO result = quizService.submitQuiz(moduleUuid, quizUuid, submission);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{quizUuid}/attempts")
    public ResponseEntity<List<QuizAttemptResponseDTO>> getAttempts(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,
            @PathVariable UUID quizUuid,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean pendingReview
    ) {
        List<QuizAttemptResponseDTO> attempts = quizService.getAttempts(moduleUuid, quizUuid, search, pendingReview).stream()
                .map(this::mapAttemptToDTO)
                .toList();
        return ResponseEntity.ok(attempts);
    }

    @GetMapping("/{quizUuid}/my-attempt")
    public ResponseEntity<QuizAttemptResponseDTO> getMyAttempt(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,
            @PathVariable UUID quizUuid
    ) {
        return quizService.getMyAttempt(moduleUuid, quizUuid)
                .map(attempt -> ResponseEntity.ok(mapAttemptToDTO(attempt)))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{quizUuid}/attempts/{attemptUuid}/evaluate")
    public ResponseEntity<Void> evaluateAttempt(
            @PathVariable UUID courseUuid,
            @PathVariable UUID moduleUuid,
            @PathVariable UUID quizUuid,
            @PathVariable UUID attemptUuid,
            @RequestBody EvaluateAttemptDTO dto
    ) {
        quizService.evaluateAttempt(moduleUuid, quizUuid, attemptUuid, dto);
        return ResponseEntity.noContent().build();
    }

    private QuizAttemptResponseDTO mapAttemptToDTO(QuizAttempt attempt) {
        QuizAttemptResponseDTO dto = new QuizAttemptResponseDTO();
        dto.setUuid(attempt.getUuid());
        dto.setStudentUsername(attempt.getStudent() != null ? attempt.getStudent().getUsername() : null);
        dto.setScore(attempt.getScore());
        dto.setMaxScore(attempt.getMaxScore());
        dto.setCorrectPerQuestion(attempt.getCorrectPerQuestion());
        dto.setPendingReview(attempt.isPendingReview());
        dto.setSubmittedAt(attempt.getSubmittedAt());
        if (attempt.getTextAnswersJson() != null) {
            try {
                dto.setTextAnswers(objectMapper.readValue(attempt.getTextAnswersJson(), new TypeReference<>() {}));
            } catch (Exception e) {
                dto.setTextAnswers(Map.of());
            }
        }
        if (attempt.getAnswersJson() != null) {
            try {
                dto.setAnswers(objectMapper.readValue(attempt.getAnswersJson(), new TypeReference<>() {}));
            } catch (Exception e) {
                dto.setAnswers(Map.of());
            }
        }
        if (attempt.getEvaluationsJson() != null) {
            try {
                dto.setEvaluations(objectMapper.readValue(attempt.getEvaluationsJson(), new TypeReference<>() {}));
            } catch (Exception e) {
                dto.setEvaluations(Map.of());
            }
        }
        return dto;
    }
}
