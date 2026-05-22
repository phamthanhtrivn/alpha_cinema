package com.movieticket.notification.config;

import java.security.Principal;
import java.util.Objects;

public class WebSocketPrincipal implements Principal {
    private final String name;

    public WebSocketPrincipal(String name) {
        this.name = name;
    }

    @Override
    public String getName() {
        return name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        WebSocketPrincipal that = (WebSocketPrincipal) o;
        return Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(name);
    }
}
