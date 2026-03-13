package com.movieticket.product.util;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.movieticket.product.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

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
                                "public_id", fileName,
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
        // filename.jpg
        String filename = url.substring(url.lastIndexOf("/") + 1);
        // filename
        return filename.substring(0, filename.lastIndexOf("."));
    }
}
