package cz.projektant_pata.tda26.dto.course.material;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class UrlMaterialResponseDTO extends MaterialResponseDTO {
    private String url;
    private String faviconUrl;
}
