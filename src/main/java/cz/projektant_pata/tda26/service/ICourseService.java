package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.user.User;

import java.util.List;
import java.util.UUID;

public interface ICourseService {
    List<Course> find();
    Course find(UUID uuid);
    Course update(UUID uuid, Course course);
    Course create(Course course);
    Course kill(UUID uuid);

    List<User> findStudents(UUID uuid);
    Course addStudent(UUID courseUuid, UUID studentUuid);
    Course removeStudent(UUID courseUuid, UUID studentUuid);
}
