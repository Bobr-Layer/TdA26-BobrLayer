package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MaterialRepository extends JpaRepository<Material, UUID> {
    List<Material> findByCourseUuid(UUID courseUuid);
}
