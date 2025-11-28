package cz.projektant_pata.tda26.model.course.material;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class UrlMaterial extends Material {
    private String url;
    private String faviconUrl;
}

