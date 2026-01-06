package cz.projektant_pata.tda26.repository;

import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FeedItemRepository extends JpaRepository<FeedItem, UUID> {
    List<FeedItem> findAllByCourseUuidOrderByCreatedAtDesc(UUID courseUuid);}
