package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.course.Course;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import cz.projektant_pata.tda26.model.course.module.Module;

import java.util.List;
import java.util.UUID;

public interface ModuleRepository extends JpaRepository<Module, UUID> {
    @EntityGraph(attributePaths = {"materials"})
    List<Module> findByCourseUuidOrderByIndexAsc(UUID courseUuid);
}
