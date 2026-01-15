import { getCourseFeed } from './FeedService';

export function useFeedPolling(courseId, onNewFeeds, interval = 5000) {
    let pollingInterval = null;
    let lastFeedUuids = new Set();
    
    const pollFeeds = async () => {
        if (!courseId) return;
        
        try {
            const feeds = await getCourseFeed(courseId);
            
            const newFeeds = feeds.filter(feed => !lastFeedUuids.has(feed.uuid));
            
            if (newFeeds.length > 0) {
                lastFeedUuids = new Set(feeds.map(feed => feed.uuid));
                newFeeds.forEach(feed => onNewFeeds(feed));
            }
        } catch (error) {
            console.error('Polling error:', error);
        }
    };
    
    const startPolling = () => {
        if (pollingInterval) clearInterval(pollingInterval);
        
        pollFeeds();
        pollingInterval = setInterval(pollFeeds, interval);
    };
    
    const stopPolling = () => {
        if (pollingInterval) {
            clearInterval(pollingInterval);
            pollingInterval = null;
        }
        lastFeedUuids.clear();
    };
    
    return { startPolling, stopPolling };
}