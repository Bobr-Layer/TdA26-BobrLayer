package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.branch.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BranchRepository extends JpaRepository<Branch, UUID> {
    List<Branch> findAllByOrderByCreatedAtDesc();
    Optional<Branch> findByName(String name);

    @Query("SELECT b FROM Branch b JOIN b.managers m WHERE m.uuid = :adminUuid ORDER BY b.createdAt DESC")
    List<Branch> findByManagerUuid(@Param("adminUuid") UUID adminUuid);
}
