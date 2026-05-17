package com.movieticket.ai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PopularQuestionResponse {
    private String question;
    private Long count;
}
