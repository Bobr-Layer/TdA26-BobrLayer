package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequestDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizDTO;
import cz.projektant_pata.tda26.dto.course.quiz.question.SubmitQuizResultDTO;
import cz.projektant_pata.tda26.mapper.QuizMapper;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import cz.projektant_pata.tda26.service.IQuizService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/courses/{courseUuid}/modules/{moduleUuid}/quizzes") // ✅ opravena URL
@RequiredArgsConstructor
public class QuizController {

    private final IQuizService quizService;
    private final QuizMapper quizMapper; // ✅ mapper injektován místo privátních metod

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
            @PathVariable UUID moduleUuid,  // ✅ přidáno
            @PathVariable UUID quizUuid,
            @RequestBody @Valid SubmitQuizDTO submission
    ) {
        SubmitQuizResultDTO result = quizService.submitQuiz(moduleUuid, quizUuid, submission); // ✅ bylo: courseUuid
        return ResponseEntity.ok(result);
    }
}
