package cz.projektant_pata.tda26.controller.view;

import cz.projektant_pata.tda26.controller.MaterialController;
import cz.projektant_pata.tda26.dto.course.material.MaterialResponse;
import cz.projektant_pata.tda26.dto.course.material.UrlMaterialRequest;
import cz.projektant_pata.tda26.dto.course.material.FileMaterialResponse;
import cz.projektant_pata.tda26.dto.course.material.UrlMaterialResponse;
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

    private final MaterialController apiController;
    private final ICourseService courseService;

    // ... create metody zůstávají stejné ...

    @GetMapping("/new")
    public String showAddForms(@PathVariable UUID courseUuid, Model model) {
        model.addAttribute("course", courseService.find(courseUuid));
        return "material_form";
    }

    // --- Create metody (zkráceno pro přehlednost) ---
    @PostMapping("/link")
    public String addUrlMaterial(@PathVariable UUID courseUuid, @RequestParam String name, @RequestParam String url, @RequestParam(required = false) String description) {
        UrlMaterialRequest request = new UrlMaterialRequest();
        request.setCourseId(courseUuid); request.setName(name); request.setDescription(description); request.setUrl(url);
        apiController.create(courseUuid, request);
        return "redirect:/courses/" + courseUuid;
    }
    @PostMapping("/file")
    public String addFileMaterial(@PathVariable UUID courseUuid, @RequestParam("file") MultipartFile file, @RequestParam String name, @RequestParam(required = false) String description) {
        apiController.create(courseUuid, file, name, description);
        return "redirect:/courses/" + courseUuid;
    }
    @PostMapping("/{materialUuid}/delete")
    public String deleteMaterial(@PathVariable UUID courseUuid, @PathVariable UUID materialUuid) {
        apiController.kill(courseUuid, materialUuid);
        return "redirect:/courses/" + courseUuid;
    }

    // --- NOVÉ: Editace ---

    // 1. Zobrazení formuláře pro editaci
    @GetMapping("/{materialUuid}/edit")
    public String showEditForm(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid,
            Model model
    ) {
        // Načteme materiál přes API controller (získáme DTO Response)
        MaterialResponse material = apiController.find(courseUuid, materialUuid).getBody();

        // Přidáme data do modelu
        model.addAttribute("course", courseService.find(courseUuid));
        model.addAttribute("material", material);

        // Pomocná proměnná pro typ, abychom v šabloně věděli, co zobrazit
        if (material instanceof UrlMaterialResponse) {
            model.addAttribute("type", "url");
            model.addAttribute("urlValue", ((UrlMaterialResponse) material).getUrl());
        } else if (material instanceof FileMaterialResponse) {
            model.addAttribute("type", "file");
            // fileUrl není pro input třeba, ale pro info se hodí
        }

        return "material_edit";
    }

    // 2. Zpracování editace URL (JSON update)
    @PostMapping("/{materialUuid}/edit/link")
    public String updateUrlMaterial(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid,
            @RequestParam String name,
            @RequestParam String url,
            @RequestParam(required = false) String description
    ) {
        UrlMaterialRequest request = new UrlMaterialRequest();
        request.setCourseId(courseUuid); // Pro jistotu
        request.setName(name);
        request.setDescription(description);
        request.setUrl(url);

        // Voláme API metodu updateJson
        apiController.updateJson(courseUuid, materialUuid, request);

        return "redirect:/courses/" + courseUuid;
    }

    // 3. Zpracování editace SOUBORU (Multipart update)
    @PostMapping("/{materialUuid}/edit/file")
    public String updateFileMaterial(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid,
            @RequestParam(value = "file", required = false) MultipartFile file, // Volitelné
            @RequestParam String name,
            @RequestParam(required = false) String description
    ) {
        // Voláme API metodu updateFile
        apiController.updateFile(courseUuid, materialUuid, file, name, description);

        return "redirect:/courses/" + courseUuid;
    }
}
