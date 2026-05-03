package com.movieticket.cinema.service;

import com.movieticket.cinema.dto.SeatTypeRequest;
import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.entity.SeatType;
import com.movieticket.cinema.repository.SeatTypeRepository;
import com.movieticket.cinema.util.GenerateID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SeatTypeService {
    @Autowired
    SeatTypeRepository seatTypeRepository;

    public List<SeatType> getAllSeatTypes() {
        try{
            return seatTypeRepository.findAll();
        }
        catch(Exception e){
            System.out.println(e);
        }
        return null;
    }

    public Page<SeatType> getAllSeatTypesAndPage(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        if (name != null && !name.trim().isEmpty()) {
            return seatTypeRepository.findByNameContainingIgnoreCase(name.trim(), pageable);
        }

        return seatTypeRepository.findAll(pageable);
    }



    public SeatType createSeatType(SeatTypeRequest seatTypeRequest) {
        try{
            String id = GenerateID.generateSeatTypeId();
            return seatTypeRepository.save(new SeatType(id,seatTypeRequest.getName(), seatTypeRequest.getDescription()));
        }
        catch(Exception e){
            System.out.println(e);
        }
        return null;
    }

    public SeatType editSeatType(SeatTypeRequest seatTypeRequest, String id) {
        try{
            SeatType seatType = seatTypeRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("SeatType khong ton tai"));
            seatType.setName(seatTypeRequest.getName());
            seatType.setDescription(seatTypeRequest.getDescription());
            return seatTypeRepository.save(seatType);
        }
        catch(Exception e){
            System.out.println(e);
        }
        return null;
    }
}
