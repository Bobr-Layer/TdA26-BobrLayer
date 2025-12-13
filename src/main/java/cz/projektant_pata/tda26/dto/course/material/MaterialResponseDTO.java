package cz.projektant_pata.tda26.dto.course.material;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Data;

import java.util.UUID;

@Data
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.PROPERTY,
        property = "type"
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = FileMaterialResponseDTO.class, name = "file"),
        @JsonSubTypes.Type(value = UrlMaterialResponseDTO.class, name = "url")
})
public abstract class MaterialResponseDTO {
    private UUID uuid;
    private String name;
    private String description;
}
