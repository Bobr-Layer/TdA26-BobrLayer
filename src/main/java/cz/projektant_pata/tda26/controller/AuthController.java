package cz.projektant_pata.tda26.controller;

import cz.projektant_pata.tda26.dto.auth.LoginRequestDTO;
import cz.projektant_pata.tda26.dto.auth.ProfileUpdateDTO;
import cz.projektant_pata.tda26.dto.auth.RegisterRequestDTO;
import cz.projektant_pata.tda26.dto.auth.ResetPasswordDTO;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import cz.projektant_pata.tda26.dto.course.CourseResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.OpenQuestionEvaluationDTO;
import cz.projektant_pata.tda26.dto.course.quiz.StudentAttemptDTO;
import cz.projektant_pata.tda26.dto.user.UserResponseDTO;
import cz.projektant_pata.tda26.mapper.CourseMapper;
import cz.projektant_pata.tda26.mapper.UserMapper;
import cz.projektant_pata.tda26.model.course.quiz.OpenQuestion;
import cz.projektant_pata.tda26.model.course.quiz.Question;
import cz.projektant_pata.tda26.model.course.quiz.QuizAttempt;
import cz.projektant_pata.tda26.model.user.RoleEnum;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.QuizAttemptRepository;
import cz.projektant_pata.tda26.service.IUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Slf4j
public class AuthController {

    private final IUserService service;
    private final AuthenticationManager authManager;
    private final UserMapper mapper;
    private final CourseMapper courseMapper;
    private final QuizAttemptRepository quizAttemptRepository;
    private final ObjectMapper objectMapper;

    // Registrace — vždy STUDENT, učitel/admin se registrovat nemůže
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequestDTO request) {
        User user = mapper.toEntity(request);
        user.setRole(RoleEnum.STUDENT);

        user = service.create(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(user));
    }

    @PostMapping("/registerAdmin")
    public ResponseEntity<?> registerAdmin(@RequestBody RegisterRequestDTO request) {
        User user = mapper.toEntity(request);
        user.setRole(RoleEnum.ADMIN);
        user = service.create(user);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(mapper.toResponse(user));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequestDTO request) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(mapper.toResponse(user));
        } catch (Exception e) {
            log.error("Login failed for user: {}", request.getUsername(), e);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        SecurityContextHolder.clearContext();

        return ResponseEntity.ok("Odhlášení proběhlo úspěšně");
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponseDTO> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()
                && authentication.getPrincipal() instanceof User) {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(mapper.toResponse(user));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @PutMapping("/reset-password/{uuid}")
    public ResponseEntity<UserResponseDTO> updatePassword(@PathVariable UUID uuid,
            @RequestBody ResetPasswordDTO request) {

        User updatedUser = service.update(uuid, request.getPassword());

        return ResponseEntity.ok(mapper.toResponse(updatedUser));
    }

    // Úprava vlastního profilu (username a/nebo heslo)
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileUpdateDTO request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = (User) authentication.getPrincipal();

        User updates = new User();
        if (request.getUsername() != null) {
            updates.setUsername(request.getUsername());
        }
        if (request.getPassword() != null) {
            updates.setPassword(request.getPassword());
        }

        User updated = service.update(currentUser.getUuid(), updates);
        return ResponseEntity.ok(mapper.toResponse(updated));
    }

    // Výsledky kvízů přihlášeného studenta (pouze vyhodnocené)
    @GetMapping("/me/quiz-attempts")
    public ResponseEntity<?> getMyQuizAttempts() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        User currentUser = (User) authentication.getPrincipal();
        List<StudentAttemptDTO> attempts = quizAttemptRepository
                .findByStudentUuidAndPendingReviewFalseOrderBySubmittedAtDesc(currentUser.getUuid())
                .stream()
                .map(this::mapToStudentAttempt)
                .toList();
        return ResponseEntity.ok(attempts);
    }

    private StudentAttemptDTO mapToStudentAttempt(QuizAttempt a) {
        StudentAttemptDTO dto = new StudentAttemptDTO();
        dto.setAttemptUuid(a.getUuid());
        dto.setQuizUuid(a.getQuiz().getUuid());
        dto.setQuizTitle(a.getQuiz().getTitle());
        dto.setModuleUuid(a.getQuiz().getModule().getUuid());
        dto.setCourseUuid(a.getQuiz().getModule().getCourse().getUuid());
        dto.setCourseName(a.getQuiz().getModule().getCourse().getName());
        dto.setScore(a.getScore());
        dto.setMaxScore(a.getMaxScore());
        dto.setCorrectPerQuestion(a.getCorrectPerQuestion());
        dto.setSubmittedAt(a.getSubmittedAt());
        if (a.getTextAnswersJson() != null) {
            try {
                dto.setTextAnswers(objectMapper.readValue(a.getTextAnswersJson(), new TypeReference<>() {}));
            } catch (Exception ignored) {}
        }
        if (a.getEvaluationsJson() != null) {
            try {
                dto.setEvaluations(objectMapper.readValue(a.getEvaluationsJson(), new TypeReference<>() {}));
            } catch (Exception ignored) {}
        }
        java.util.Map<String, String> openTexts = new java.util.LinkedHashMap<>();
        for (Question q : a.getQuiz().getQuestions()) {
            if (q instanceof OpenQuestion) {
                openTexts.put(q.getUuid().toString(), q.getQuestion());
            }
        }
        if (!openTexts.isEmpty()) dto.setOpenQuestionTexts(openTexts);
        return dto;
    }

    // Kurzy přihlášeného studenta
    @GetMapping("/me/courses")
    public ResponseEntity<?> getMyEnrolledCourses() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof User)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        User currentUser = (User) authentication.getPrincipal();
        // Refresh user from DB to get enrolled courses
        User freshUser = service.find(currentUser.getUuid());

        List<CourseResponseDTO> courses = freshUser.getEnrolledCourses().stream()
                .map(courseMapper::toResponse)
                .collect(Collectors.toList());

        return ResponseEntity.ok(courses);
    }
}
