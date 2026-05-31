package com.movieticket.product.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductListDTO {
    private String id;
    private String name;
    private double unitPrice;
    private String pictureUrl;
    private Integer stockQty;
}
