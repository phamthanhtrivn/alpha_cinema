package com.movieticket.product.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.movieticket.product.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CloudinaryUtil {
    private final Cloudinary cloudinary;

    public String uploadImage(MultipartFile file) {
        try {
            String fileName = file.getOriginalFilename();
            Map<?, ?> uploadResult = null;
            if (fileName != null) {
                uploadResult = cloudinary.uploader().upload(
                        file.getBytes(),
                        Map.of(
                                "folder", "alpha-cinema",
                                "public_id", UUID.randomUUID() + "_" + fileName.substring(0, fileName.lastIndexOf(".")),
                                "resource_type", "image",
                                "overwrite", true
                        )
                );
            }

            return uploadResult != null ? uploadResult.get("secure_url").toString() : null;
        } catch (IOException e) {
            throw new BusinessException("Tải ảnh lên cloudinary thất bại: " + file.getOriginalFilename());
        }
    }

    public void deleteByUrl(String imageUrl) {
        try {
            String publicId = extractPublicId(imageUrl);

            cloudinary.uploader().destroy(
                    publicId,
                    ObjectUtils.emptyMap()
            );

        } catch (Exception e) {
            throw new BusinessException("Xóa ảnh từ Cloudinary thất bại: " + imageUrl);
        }
    }

    private String extractPublicId(String url) {
        // alpha-cinema/abc123_avatar.png
        String path = url.substring(url.indexOf("alpha-cinema"));
        // alpha-cinema/abc123_avatar
        return path.substring(0, path.lastIndexOf("."));
    }
}
