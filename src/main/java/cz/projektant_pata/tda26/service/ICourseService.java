package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.Course;

import java.util.List;
import java.util.UUID;

public interface ICourseService {
    List<Course> find();
    Course find(UUID uuid);
    Course update(UUID uuid, Course course);
    Course create(Course course);
    Course kill(UUID uuid);

}
