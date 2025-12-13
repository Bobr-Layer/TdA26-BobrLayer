package cz.projektant_pata.tda26.dto.course.quiz.question;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = SingleChoiceQuestionResponseDTO.class, name = "singleChoice"),
        @JsonSubTypes.Type(value = MultipleChoiceQuestionResponseDTO.class, name = "multipleChoice")
})
@Data
public abstract class QuestionResponseDTO {
    private UUID uuid;
    private String question;
    private List<String> options;
    private String type;
    private Double successRate;
}
