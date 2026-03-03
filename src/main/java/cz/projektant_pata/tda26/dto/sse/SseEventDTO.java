package cz.projektant_pata.tda26.dto.sse;

public record SseEventDTO<T>(String type, T payload) {}
