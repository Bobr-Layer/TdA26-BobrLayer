package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.module.Module;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CourseRepository extends JpaRepository<Course, UUID> {
    @EntityGraph(attributePaths = {"modules", "feed"})
    List<Course> findAll();

    @EntityGraph(attributePaths = {"modules", "feed"})
    @Query("SELECT c FROM Course c WHERE c.status IN :visibleStatuses")
    List<Course> findForStudents(@Param("visibleStatuses") List<StatusEnum> visibleStatuses);
}
