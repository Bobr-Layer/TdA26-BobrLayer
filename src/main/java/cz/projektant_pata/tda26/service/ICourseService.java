package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.model.course.module.Module;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface ICourseService {
    List<Course> find();
    Course find(UUID uuid);
    List<Course> findForStudent();
    Course update(UUID uuid, Course course);
    Course create(Course course);
    Course kill(UUID uuid);

    Course backToDraft(UUID course);
    Course schedule(UUID course, Instant date);
    Course start(UUID course);
    Course pause(UUID course);
    Course archive(UUID course);

    Module activateNextModule(UUID courseUuid);
    Module deactivatePreviousModule(UUID courseUuid);


    List<User> findStudents(UUID uuid);
    Course addStudent(UUID courseUuid, UUID studentUuid);
    Course removeStudent(UUID courseUuid, UUID studentUuid);
}
