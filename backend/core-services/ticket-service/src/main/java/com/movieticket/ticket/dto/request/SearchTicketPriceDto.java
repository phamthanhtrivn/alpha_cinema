package com.movieticket.ticket.dto.request;

import com.movieticket.ticket.enums.DayType;
import com.movieticket.ticket.enums.ProjectionType;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SearchTicketPriceDto {
    private String id;
    private String seatTypeId;
    private ProjectionType projectionType;
    private DayType dayType;
    private Double minPrice;
    private Double maxPrice;
    private Boolean status;
}
