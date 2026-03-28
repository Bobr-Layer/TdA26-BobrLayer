package cz.projektant_pata.tda26.dto.course.quiz.question;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = SingleChoiceQuestionRequestDTO.class, name = "singleChoice"),
        @JsonSubTypes.Type(value = MultipleChoiceQuestionRequestDTO.class, name = "multipleChoice"),
        @JsonSubTypes.Type(value = OpenQuestionRequestDTO.class, name = "openQuestion")
})
@Getter
@Setter
@NoArgsConstructor
public abstract class QuestionRequestDTO {

    private UUID uuid;

    @NotBlank(message = "Text otázky nesmí být prázdný")
    private String question;

    private String type;

    private List<String> options;
}
