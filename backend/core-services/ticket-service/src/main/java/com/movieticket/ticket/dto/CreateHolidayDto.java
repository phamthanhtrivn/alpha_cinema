package com.movieticket.ticket.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CreateHolidayDto {
    @NotBlank(message = "Tên ngày lễ không được để trống")
    private String name;

    @NotNull(message = "Ngày bắt đầu là bắt buộc")
    @FutureOrPresent(message = "Ngày bắt đầu phải là hôm nay hoặc trong tương lai")
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc là bắt buộc")
    @FutureOrPresent(message = "Ngày kết thúc phải là hôm nay hoặc trong tương lai")
    private LocalDate endDate;

    private String description;
}
