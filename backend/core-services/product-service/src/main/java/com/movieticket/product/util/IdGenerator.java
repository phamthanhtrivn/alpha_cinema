package com.movieticket.product.util;

import java.util.UUID;

public class IdGenerator {

    public static String generateProductId() {
        return "PR" + UUID.randomUUID().toString().substring(0, 10);
    }

}
