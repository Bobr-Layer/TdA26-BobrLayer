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
        @JsonSubTypes.Type(value = FileMaterialRequest.class, name = "file"),
        @JsonSubTypes.Type(value = UrlMaterialRequest.class, name = "url")
})
public abstract class MaterialRequest {
    private UUID uuid;
    private String name;
    private String description;
    private UUID courseId;
}
