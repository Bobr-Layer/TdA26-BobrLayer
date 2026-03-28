package cz.projektant_pata.tda26.dto.course.material;

import lombok.Data;

@Data
public class UrlMaterialImportDTO {
    private String name;
    private String description;
    private String url;
    private String faviconUrl;
}
