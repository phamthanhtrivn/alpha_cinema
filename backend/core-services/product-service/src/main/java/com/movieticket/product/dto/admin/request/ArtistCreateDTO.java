package com.movieticket.product.dto.admin.request;

import com.movieticket.product.enums.ArtistType;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

public class ArtistCreateDTO {
    @NotBlank(message = "Tên nghệ sĩ không được để trống")
    private String fullName;
    private String bio;
    private LocalDate dateOfBirth;

    @NotBlank(message = "Quốc gia không được để trống")
    private String nationality;

    @NotBlank(message = "Hãy chọn vai trò chính của nghệ sĩ")
    private ArtistType type;
}
