package cz.projektant_pata.tda26.model;

import jakarta.persistence.Entity;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class FileMaterial extends Material {
    private String fileUrl;
    private String mimeType;
    private Integer sizeBytes;
}
