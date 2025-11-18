package cz.projektant_pata.tda26.security;

import cz.projektant_pata.tda26.repository.CourseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component("courseSecurity") // Název beany pro použití v SpEL
@RequiredArgsConstructor
public class CourseSecurity {

    private final CourseRepository courseRepository;

    /**
     * Ověří, zda je aktuálně přihlášený uživatel lektorem daného kurzu.
     * @param courseUuid ID kurzu
     * @param username Uživatelské jméno přihlášeného uživatele
     */
    public boolean isLector(UUID courseUuid, String username) {
        return courseRepository.findById(courseUuid)
                .map(course -> course.getLector().getUsername().equals(username))
                .orElse(false);
    }
}
