package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.course.quiz.QuizRequest;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponse;
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
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses/{courseUuid}/quizes")
@RequiredArgsConstructor
public class QuizController {
    private final IQuizService service;
    private final QuizMapper mapper;

    @GetMapping
    public ResponseEntity<List<QuizResponse>> find(@PathVariable UUID courseUuid){
        List<QuizResponse> response = service.find(courseUuid).stream()
                .map(mapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{quizUuid}")
    public ResponseEntity<QuizResponse> find(
            @PathVariable UUID courseUuid,
            @PathVariable UUID quizUuid
    ){
        Quiz quiz = service.find(courseUuid, quizUuid);
        return ResponseEntity.ok(mapper.toResponse(quiz));
    }

    @PostMapping
    public ResponseEntity<QuizResponse> create(
            @PathVariable UUID courseUuid,
            @Valid @RequestBody QuizRequest request
    ) {
        Quiz quizDraft = mapper.toEntity(request);
        Quiz createdQuiz = service.create(courseUuid, quizDraft);

        QuizResponse response = mapper.toResponse(createdQuiz);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{quizUuid}")
    public ResponseEntity<QuizResponse> update(
            @PathVariable UUID courseUuid,
            @PathVariable UUID quizUuid,
            @Valid @RequestBody QuizRequest request
    ) {
        Quiz quizDraft = mapper.toEntity(request);
        Quiz updatedQuiz = service.update(courseUuid, quizUuid, quizDraft);

        return ResponseEntity.ok(mapper.toResponse(updatedQuiz));
    }

    @DeleteMapping("/{quizUuid}")
    public ResponseEntity<Void> delete(
            @PathVariable UUID courseUuid,
            @PathVariable UUID quizUuid
    ) {
        service.kill(courseUuid, quizUuid);
        return ResponseEntity.noContent().build();
    }
}
