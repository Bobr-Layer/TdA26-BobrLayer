package cz.projektant_pata.tda26.service;

import cz.projektant_pata.tda26.exception.ResourceNotFoundException;
import cz.projektant_pata.tda26.model.course.Course;
import cz.projektant_pata.tda26.model.course.StatusEnum;
import cz.projektant_pata.tda26.model.course.feed.FeedItem;
import cz.projektant_pata.tda26.model.course.feed.FeedType;
import cz.projektant_pata.tda26.model.user.User;
import cz.projektant_pata.tda26.repository.CourseRepository;
import cz.projektant_pata.tda26.repository.FeedItemRepository;
import cz.projektant_pata.tda26.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedItemServiceImpl implements IFeedItemService {

    private final FeedItemRepository feedRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public List<FeedItem> find(UUID courseUuid) {
        return feedRepository.findAllByCourseUuidOrderByCreatedAtDesc(courseUuid);
    }
    @Override
    @Transactional(readOnly = true)
    public List<FeedItem> find(){
        return feedRepository.findAll();
    }
    @Override
    @Transactional
    public FeedItem create(UUID courseUuid, UUID authorUuid, String message) {
        Course course = getCourse(courseUuid);
        User author = getUser(authorUuid);
        return saveFeedItem(course, author, FeedType.MANUAL, message);
    }

    @Override
    @Transactional
    public FeedItem create(UUID courseUuid, FeedType type, String message) {
        Course course = getCourse(courseUuid);
        if (type == FeedType.SYSTEM && course.getStatus().equals(StatusEnum.Draft))
            return null;
        return saveFeedItem(course, null, type, message);
    }

    @Override
    @Transactional
    public FeedItem update(UUID courseUuid, UUID itemUuid, String newMessage) {
        FeedItem item = getFeedItem(itemUuid);
        if (!item.getCourse().getUuid().equals(courseUuid))
            throw new ResourceNotFoundException("Příspěvek nenalezen v kurzu " + courseUuid);

        item.setMessage(newMessage);
        item.setEdited(true);
        item.setAuthor(null);

        return feedRepository.save(item);
    }

    @Override
    @Transactional
    public void delete(UUID courseUuid, UUID itemUuid) {
        FeedItem item = getFeedItem(itemUuid);
        if (!item.getCourse().getUuid().equals(courseUuid))
            throw new ResourceNotFoundException("Příspěvek nenalezen v kurzu " + courseUuid);

        feedRepository.delete(item);
    }

    private Course getCourse(UUID uuid) {
        return courseRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Kurz nenalezen: " + uuid));
    }

    private User getUser(UUID uuid) {
        return userRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Uživatel nenalezen: " + uuid));
    }

    private FeedItem getFeedItem(UUID uuid) {
        return feedRepository.findById(uuid)
                .orElseThrow(() -> new ResourceNotFoundException("Příspěvek nenalezen: " + uuid));
    }

    private FeedItem saveFeedItem(Course course, User author, FeedType type, String message) {
        FeedItem item = new FeedItem();
        item.setCourse(course);
        item.setAuthor(author);
        item.setType(type);
        item.setMessage(message);
        item.setEdited(false);
        return feedRepository.save(item);
    }

    private void verifyAuthor(FeedItem item, UUID userUuid) {
        if (item.getAuthor() != null && !item.getAuthor().getUuid().equals(userUuid))
            throw new IllegalArgumentException("You can only edit/delete your own posts");

        if (item.getAuthor() == null)
            throw new IllegalArgumentException("Cannot edit/delete system generated posts");

    }
}
