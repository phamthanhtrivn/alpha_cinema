package com.movieticket.product.service;

import com.movieticket.product.entity.Artist;
import com.movieticket.product.exception.BusinessException;
import com.movieticket.product.repository.ArtistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ArtistService {
    private final ArtistRepository artistRepository;

    public Page<Artist> getAll(Pageable pageable) {
        return artistRepository.findAll(pageable);
    }

    public Artist getById(String id) {
        return artistRepository.findById(id).orElseThrow(() -> new BusinessException("Không tìm thấy nghệ sĩ"));
    }

    public void delete(String id){
        artistRepository.deleteById(id);
    }
}
