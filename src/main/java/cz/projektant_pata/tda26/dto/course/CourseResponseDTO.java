package cz.projektant_pata.tda26.dto.course;

import cz.projektant_pata.tda26.dto.course.feed.FeedResponseDTO;
import cz.projektant_pata.tda26.dto.course.material.MaterialResponseDTO;
import cz.projektant_pata.tda26.dto.course.quiz.QuizResponseDTO;
import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import cz.projektant_pata.tda26.model.course.quiz.Quiz;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CourseResponseDTO {
    private UUID uuid;
    private String name;
    private String description;

    private UUID lectorId;
    private String lectorName;

    private List<MaterialResponseDTO> materials;
    private List<QuizResponseDTO> quizzes;
    private List<FeedResponseDTO> feed;
}
