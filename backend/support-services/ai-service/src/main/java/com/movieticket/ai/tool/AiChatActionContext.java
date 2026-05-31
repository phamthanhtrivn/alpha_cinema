package com.movieticket.ai.tool;

import com.movieticket.ai.dto.response.ChatActionResponse;

import java.util.ArrayList;
import java.util.List;

public final class AiChatActionContext {
    private static final ThreadLocal<List<ChatActionResponse>> ACTIONS = new InheritableThreadLocal<>();

    private AiChatActionContext() {
    }

    public static void initialize() {
        ACTIONS.set(new ArrayList<>());
    }

    public static void addAll(List<ChatActionResponse> actions) {
        if (actions == null || actions.isEmpty()) {
            return;
        }

        List<ChatActionResponse> currentActions = ACTIONS.get();
        if (currentActions == null) {
            currentActions = new ArrayList<>();
            ACTIONS.set(currentActions);
        }

        for (ChatActionResponse action : actions) {
            if (action == null || action.url() == null || action.url().isBlank()) {
                continue;
            }

            boolean alreadyAdded = currentActions.stream()
                    .anyMatch(currentAction -> action.url().equals(currentAction.url()));
            if (!alreadyAdded) {
                currentActions.add(action);
            }
        }
    }

    public static void replaceBookingActions(List<ChatActionResponse> actions) {
        List<ChatActionResponse> currentActions = ACTIONS.get();
        if (currentActions == null) {
            currentActions = new ArrayList<>();
            ACTIONS.set(currentActions);
        }

        currentActions.removeIf(action -> "SELECT_SHOWTIME_SEATS".equals(action.type()));
        addAll(actions);
    }

    public static List<ChatActionResponse> getActions() {
        List<ChatActionResponse> actions = ACTIONS.get();
        return actions == null ? List.of() : List.copyOf(actions);
    }

    public static void clear() {
        ACTIONS.remove();
    }
}
