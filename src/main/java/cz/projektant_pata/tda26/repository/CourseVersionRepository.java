package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.course.version.CourseVersion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CourseVersionRepository extends JpaRepository<CourseVersion, Long> {

    List<CourseVersion> findByCourseUuidOrderByIdDesc(UUID courseUuid);

    Optional<CourseVersion> findByShortIdAndCourseUuid(String shortId, UUID courseUuid);

    long countByCourseUuid(UUID courseUuid);

    @Query("SELECT v.id FROM CourseVersion v WHERE v.course.uuid = :uuid ORDER BY v.id DESC")
    List<Long> findIdsByCourseUuidOrderByIdDesc(@Param("uuid") UUID uuid);

    void deleteByIdNotInAndCourseUuid(List<Long> keepIds, UUID courseUuid);
}
