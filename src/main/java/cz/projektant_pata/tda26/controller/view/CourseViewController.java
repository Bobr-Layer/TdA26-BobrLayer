package cz.projektant_pata.tda26.controller.view;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.service.ICourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Controller; // Pozor: Controller, ne RestController
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.List;
import java.util.UUID;

@Controller
@RequestMapping("/courses")
@RequiredArgsConstructor
public class CourseViewController {

    private final ICourseService service;

    @GetMapping
    public String listCourses(Model model) {
        List<Course> courses = service.find();
        model.addAttribute("courses", courses);
        return "course_list";
    }

    @GetMapping("/{uuid}")
    public String courseDetail(@PathVariable UUID uuid, Model model) {
        Course course = service.find(uuid);
        model.addAttribute("course", course);
        return "course_detail";
    }
}
