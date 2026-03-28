package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    @Query("SELECT DISTINCT u FROM User u WHERE u.branch.uuid IN :branchUuids")
    List<User> findByBranchUuidIn(@Param("branchUuids") List<UUID> branchUuids);

    @Query("SELECT u FROM User u WHERE u.branch.uuid = :branchUuid")
    List<User> findByBranchUuid(@Param("branchUuid") UUID branchUuid);

    @Query("SELECT u FROM User u JOIN u.managedBranches b WHERE b.uuid = :branchUuid")
    List<User> findManagersByBranchUuid(@Param("branchUuid") UUID branchUuid);
}
