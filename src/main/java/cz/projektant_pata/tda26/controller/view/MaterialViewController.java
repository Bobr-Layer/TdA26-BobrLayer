package cz.projektant_pata.tda26.controller.view;

import cz.projektant_pata.tda26.controller.MaterialController;
import cz.projektant_pata.tda26.dto.course.material.UrlMaterialRequest;
import cz.projektant_pata.tda26.service.ICourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Controller
@RequestMapping("/courses/{courseUuid}/materials")
@RequiredArgsConstructor
public class MaterialViewController {

    // Voláme API controller místo přímo Service
    private final MaterialController apiController;

    // Potřebujeme courseService jen pro načtení hlavičky stránky (nadpis kurzu)
    private final ICourseService courseService;

    @GetMapping("/new")
    public String showAddForms(@PathVariable UUID courseUuid, Model model) {
        model.addAttribute("course", courseService.find(courseUuid));
        return "material_form"; // Bez .html koncovky (Thymeleaf si ji doplní)
    }

    @PostMapping("/link")
    public String addUrlMaterial(
            @PathVariable UUID courseUuid,
            @RequestParam String name,
            @RequestParam String url,
            @RequestParam(required = false) String description
    ) {
        // 1. Vytvoříme DTO (jako by přišlo JSONem)
        UrlMaterialRequest request = new UrlMaterialRequest();
        request.setCourseId(courseUuid);
        request.setName(name);
        request.setDescription(description);
        request.setUrl(url);
        // Typ je důležitý pro Jackson/Mapper, pokud ho používáš pro rozhodování
        // request.setType("url"); // Pokud to máš v DTO

        // 2. Předáme API kontroleru
        apiController.create(courseUuid, request);

        return "redirect:/courses/" + courseUuid;
    }

    @PostMapping("/file")
    public String addFileMaterial(
            @PathVariable UUID courseUuid,
            @RequestParam("file") MultipartFile file,
            @RequestParam String name,
            @RequestParam(required = false) String description
    ) {
        // Zde jen přeposíláme parametry do API metody pro soubory
        apiController.create(courseUuid, file, name, description);

        return "redirect:/courses/" + courseUuid;
    }

    @PostMapping("/{materialUuid}/delete")
    public String deleteMaterial(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid
    ) {
        apiController.kill(courseUuid, materialUuid);
        return "redirect:/courses/" + courseUuid;
    }
}
