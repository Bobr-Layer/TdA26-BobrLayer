package cz.projektant_pata.tda26.model.course.feed;

import com.fasterxml.jackson.annotation.JsonValue;

public enum FeedType {

    MANUAL("manual"),

    SYSTEM("system");

    private final String value;

    FeedType(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
