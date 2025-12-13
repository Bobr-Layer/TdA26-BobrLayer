package cz.projektant_pata.tda26.controller.view;

import cz.projektant_pata.tda26.dto.course.material.MaterialResponse;
import cz.projektant_pata.tda26.dto.course.material.UrlMaterialRequest;
import cz.projektant_pata.tda26.dto.course.material.FileMaterialResponse;
import cz.projektant_pata.tda26.dto.course.material.UrlMaterialResponse;
import cz.projektant_pata.tda26.mapper.MaterialMapper;
import cz.projektant_pata.tda26.model.course.material.Material;
import cz.projektant_pata.tda26.service.ICourseService;
import cz.projektant_pata.tda26.service.IMaterialService;
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

    private final IMaterialService materialService;
    private final ICourseService courseService;
    private final MaterialMapper mapper;

    @GetMapping("/new")
    public String showAddForms(@PathVariable UUID courseUuid, Model model) {
        model.addAttribute("course", courseService.find(courseUuid));
        return "material_form";
    }

    @PostMapping("/link")
    public String addUrlMaterial(@PathVariable UUID courseUuid, @RequestParam String name, @RequestParam String url, @RequestParam(required = false) String description) {
        UrlMaterialRequest request = new UrlMaterialRequest();
        request.setCourseId(courseUuid);
        request.setName(name);
        request.setDescription(description);
        request.setUrl(url);

        Material materialDraft = mapper.toEntity(request);
        materialService.create(courseUuid, materialDraft);

        return "redirect:/courses/" + courseUuid;
    }

    @PostMapping("/file")
    public String addFileMaterial(@PathVariable UUID courseUuid, @RequestParam("file") MultipartFile file, @RequestParam String name, @RequestParam(required = false) String description) {
        materialService.create(courseUuid, file, name, description);
        return "redirect:/courses/" + courseUuid;
    }

    @PostMapping("/{materialUuid}/delete")
    public String deleteMaterial(@PathVariable UUID courseUuid, @PathVariable UUID materialUuid) {
        materialService.kill(courseUuid, materialUuid);
        return "redirect:/courses/" + courseUuid;
    }

    @GetMapping("/{materialUuid}/edit")
    public String showEditForm(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid,
            Model model
    ) {
        Material materialEntity = materialService.find(courseUuid, materialUuid);
        MaterialResponse material = mapper.toResponse(materialEntity);

        model.addAttribute("course", courseService.find(courseUuid));
        model.addAttribute("material", material);

        if (material instanceof UrlMaterialResponse) {
            model.addAttribute("type", "url");
            model.addAttribute("urlValue", ((UrlMaterialResponse) material).getUrl());
        } else if (material instanceof FileMaterialResponse) {
            model.addAttribute("type", "file");
        }

        return "material_edit";
    }

    @PostMapping("/{materialUuid}/edit/link")
    public String updateLink(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid,
            @RequestParam String name,
            @RequestParam String url,
            @RequestParam(required = false) String description
    ) {
        materialService.update(courseUuid, materialUuid, name, description, url);

        return "redirect:/courses/" + courseUuid;
    }

    @PostMapping("/{materialUuid}/edit/file")
    public String updateFile(
            @PathVariable UUID courseUuid,
            @PathVariable UUID materialUuid,
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam String name,
            @RequestParam(required = false) String description
    ) {
        materialService.update(courseUuid, materialUuid, file, name, description);

        return "redirect:/courses/" + courseUuid;
    }
}
