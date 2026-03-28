package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.version.CourseVersion;
import cz.projektant_pata.tda26.model.course.version.snapshot.CourseSnapshot;

import java.util.List;
import java.util.UUID;

public interface ICourseVersionService {
    List<CourseVersion> listVersions(UUID courseUuid);
    CourseVersion createSnapshot(UUID courseUuid);
    CourseVersion getVersion(UUID courseUuid, String shortId);
    CourseSnapshot deserializeSnapshot(CourseVersion version);
    Course rollback(UUID courseUuid, String shortId);
}
