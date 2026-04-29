package com.movieticket.product.dto.request;

import com.movieticket.product.enums.ProductType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SearchProductDto {
    private String id;
    private String name;
    private Double minPrice;
    private Double maxPrice;
    private ProductType type;
    private Boolean status;
}
