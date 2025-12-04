package cz.projektant_pata.tda26.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/")
public class WelcomeController {

    @GetMapping
    public Map<String, String> welcome() {
        Map<String, String> response = new HashMap<>();
        response.put("organization", "Student Cyber Games");
        return response;
    }
}
