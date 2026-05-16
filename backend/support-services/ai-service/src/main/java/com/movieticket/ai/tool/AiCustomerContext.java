package com.movieticket.ai.tool;

public final class AiCustomerContext {
    private static final ThreadLocal<String> CUSTOMER_ID = new InheritableThreadLocal<>();

    private AiCustomerContext() {
    }

    public static void setCustomerId(String customerId) {
        CUSTOMER_ID.set(customerId);
    }

    public static String getCustomerId() {
        return CUSTOMER_ID.get();
    }

    public static void clear() {
        CUSTOMER_ID.remove();
    }
}
