package cz.projektant_pata.tda26.dto.course.quiz.Question;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = SingleChoiceQuestionResponse.class, name = "singleChoice"),
        @JsonSubTypes.Type(value = MultipleChoiceQuestionResponse.class, name = "multipleChoice")
})
@Data
public abstract class QuestionResponse {
    private UUID uuid;
    private String question;
    private List<String> options;
    private String type;
}
