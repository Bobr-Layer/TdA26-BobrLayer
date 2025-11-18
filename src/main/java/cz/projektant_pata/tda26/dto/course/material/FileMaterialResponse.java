package cz.projektant_pata.tda26.dto.course.material;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class FileMaterialResponse extends MaterialResponse {
    private String fileUrl;
    private String mimeType;
    private Integer sizeBytes;
}
