package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import cz.projektant_pata.tda26.model.course.feed.FeedType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface IFeedItemService {

    List<FeedItem> find();
    List<FeedItem> find(UUID courseUuid);
    FeedItem create(UUID courseUuid, UUID authorUuid, String message);
    FeedItem create(UUID courseUuid, FeedType type, String message);
    FeedItem update(UUID itemUuid, String newMessage);
    void delete(UUID itemUuid);
}
