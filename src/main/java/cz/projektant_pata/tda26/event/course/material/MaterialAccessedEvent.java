package cz.projektant_pata.tda26.event.course.material;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.material.Material;

public record MaterialAccessedEvent(Course course, Material material) {
}
