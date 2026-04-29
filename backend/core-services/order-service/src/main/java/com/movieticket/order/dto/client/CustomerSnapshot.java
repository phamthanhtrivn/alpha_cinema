package com.movieticket.order.dto.client;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class CustomerSnapshot {
    private String id;
    private String fullName;
    private String email;
    private int loyaltyPoint;
    private boolean status;
}
