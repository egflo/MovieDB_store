package com.user_service.models;

public enum Status {
    NONE("NONE"),
    DISLIKE("DISLIKE"),
    LIKE("LIKE"),
    LOVE("LOVE");

    private final String value;

    Status(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static Status fromString(String value) {
        for (Status status : Status.values()) {
            if (status.value.equalsIgnoreCase(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No enum constant with value " + value);
    }
}