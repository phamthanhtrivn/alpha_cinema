package com.movieticket.product.service;

import com.movieticket.product.dto.admin.request.ArtistCreateDTO;
import com.movieticket.product.dto.admin.request.ArtistSearchDTO;
import com.movieticket.product.dto.admin.response.ArtistResDTO;
import com.movieticket.product.entity.Artist;
import com.movieticket.product.exception.BusinessException;
import com.movieticket.product.repository.ArtistRepository;
import com.movieticket.product.specification.ArtistSpecification;
import com.movieticket.product.util.CloudinaryUtil;
import com.movieticket.product.util.mapper.ArtistMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import com.movieticket.product.util.ExcelHelper;
import java.io.IOException;
import java.util.List;

import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final ArtistRepository artistRepository;
    private final CloudinaryUtil cloudinaryUtil;
    private final ArtistMapper artistMapper;

    public Set<Artist> getArtistProxies(Set<String> ids) {
        if (ids == null || ids.isEmpty()) return new HashSet<>();

        return ids.stream()
                .map(artistRepository::getReferenceById)
                .collect(Collectors.toSet());
    }

    public Page<ArtistResDTO> searchArtists(ArtistSearchDTO dto, int page, int size) {
        Specification<Artist> spec = Specification.where(ArtistSpecification.hasName(dto.getName())
                        .and(ArtistSpecification.hasCountry(dto.getNationality())));

        Pageable pageable = PageRequest.of(page, size);

        Page<Artist> artistPage = artistRepository.findAll(spec, pageable);
        return artistPage.map(artistMapper::toResDTO);
    }

    @Transactional
    public Artist createArtist(ArtistCreateDTO dto, MultipartFile file) {
        String avatarUrl = null;
        if (file != null && !file.isEmpty()) {
            avatarUrl = cloudinaryUtil.uploadImage(file);
        }

        Artist artist = artistMapper.toEntity(dto);
        artist.setAvatarUrl(avatarUrl);

        return artistRepository.save(artist);
    }

    @Transactional
    public Artist updateArtist(String id, ArtistCreateDTO dto, MultipartFile file) {
        Artist artist = getById(id);

        if (file != null && !file.isEmpty()) {
            cloudinaryUtil.deleteByUrl(artist.getAvatarUrl());
            String avatarUrl = cloudinaryUtil.uploadImage(file);
            artist.setAvatarUrl(avatarUrl);
        }

        artistMapper.updateEntityFromDto(dto, artist);

        return artistRepository.save(artist);
    }

    public Artist getById(String id) {
        return artistRepository.findById(id).orElseThrow(() -> new BusinessException("Không tìm thấy nghệ sĩ"));
    }

    public void delete(String id) {
        Artist artist = getById(id);
        cloudinaryUtil.deleteByUrl(artist.getAvatarUrl());
        artistRepository.delete(artist);
    }

    @Transactional
    public void importArtistsFromExcel(MultipartFile file) {
        if (!ExcelHelper.hasExcelFormat(file)) {
            throw new BusinessException("Vui lòng tải lên tệp Excel đúng định dạng (.xlsx)");
        }
        try {
            List<Artist> artists = ExcelHelper.parseArtistExcel(file.getInputStream());

            // Kiểm tra trùng lặp nghệ sĩ đã tồn tại theo tên đầy đủ
            for (Artist artist : artists) {
                if (artistRepository.existsByFullName(artist.getFullName())) {
                    throw new BusinessException("Nghệ sĩ '" + artist.getFullName() + "' đã tồn tại trong hệ thống.");
                }
            }

            artistRepository.saveAll(artists);
        } catch (IOException e) {
            throw new BusinessException("Không thể đọc tệp Excel: " + e.getMessage());
        }
    }
}
