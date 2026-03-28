package cz.projektant_pata.tda26.model.course.version.snapshot;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UrlMaterialSnapshot extends MaterialSnapshot {
    private String url;
    private String faviconUrl;
}
