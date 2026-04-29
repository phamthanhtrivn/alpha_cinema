package com.movieticket.cinema.service;

import com.movieticket.cinema.dto.CinemaRequest;
import com.movieticket.cinema.dto.SeatResponseToProduct;
import com.movieticket.cinema.dto.SelectionDTO;
import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.repository.CinemaRepository;
import com.movieticket.cinema.util.GenerateID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class CinemaService {

    @Autowired
    private CinemaRepository cinemaRepository;

    public List<Cinema> getAllCinemas() {
        try {
            return cinemaRepository.findAll();
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return null;
    }

    public Cinema createCinema(CinemaRequest request) {
        try {
            String id = GenerateID.generateCinemaId();
            Cinema cinema = new Cinema(id, request.getName(), request.getAddress(), request.getPhone(), request.isStatus());
            return cinemaRepository.save(cinema);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return null;
    }

    public Cinema editCinema(CinemaRequest request, String id) {
        try {
            Cinema cinema = cinemaRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Cinema khong ton tai"));
            cinema.setName(request.getName());
            cinema.setAddress(request.getAddress());
            cinema.setPhone(request.getPhone());
            cinema.setStatus(request.isStatus());

            return cinemaRepository.save(cinema);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return null;
    }

    public Cinema getCinemaById(String id) {
        return cinemaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cinema khong ton tai"));
    }

    public Cinema findById(String id) {
        return cinemaRepository.findById(id).orElse(null);
    }

    public Page<Cinema> getAllCinemasAndPage(String name, String address, String phone, Boolean status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        return cinemaRepository.filterCinemas(
                name != null && !name.isEmpty() ? name : null,
                address != null && !address.isEmpty() ? address : null,
                phone != null && !phone.isEmpty() ? phone : null,
                status,
                pageable
        );
    }

    //Hà Thanh Tuấn viêt, hàm này để lấy dữ liệu đổ vào select,
    //chỉ lấy 2 trường id và tên, cho đơ nặng
    public List<SelectionDTO> getCinemasForSelection() {
        return cinemaRepository.findAllProjectedBy()
                .stream()
                .map(c -> new SelectionDTO(c.getId(), c.getName()))
                .toList();
    }

    public List<SelectionDTO> getCinemaSelectionsByIds(List<String> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyList();

        return cinemaRepository.findAllProjectedByIdIn(ids).stream()
                .map(v -> new SelectionDTO(v.getId(), v.getName()))
                .collect(Collectors.toList());
    }
}

