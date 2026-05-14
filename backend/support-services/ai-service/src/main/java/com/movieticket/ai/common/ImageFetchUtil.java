package com.movieticket.ai.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@Slf4j
public class ImageFetchUtil {

    private final RestTemplate restTemplate;

    public ImageFetchUtil() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Tải hình ảnh từ URL và trả về định dạng Resource để dùng cho Spring AI Media.
     */
    public Resource fetchImageAsResource(String url) {
        try {
            byte[] imageBytes = restTemplate.getForObject(url, byte[].class);
            if (imageBytes != null) {
                return new ByteArrayResource(imageBytes);
            }
        } catch (Exception e) {
            log.error("Không thể tải hình ảnh từ URL: {}. Lỗi: {}", url, e.getMessage());
        }
        return null;
    }
}
