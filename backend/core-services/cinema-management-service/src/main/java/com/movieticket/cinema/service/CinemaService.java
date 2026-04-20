package com.movieticket.cinema.service;

import com.movieticket.cinema.dto.CinemaRequest;
import com.movieticket.cinema.entity.Cinema;
import com.movieticket.cinema.repository.CinemaRepository;
import com.movieticket.cinema.util.GenerateID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;

@Service
public class CinemaService {
    @Autowired
    private CinemaRepository cinemaRepository;

    public List<Cinema> getAllCinemas(){
        try{
            return cinemaRepository.findAll();
        }
        catch(Exception e){
            System.out.println(e.getMessage());
        }
        return null;
    }

    public Cinema createCinema(CinemaRequest request){
        try{
            String id = GenerateID.generateCinemaId();
            Cinema cinema = new Cinema(id,request.getName(),request.getAddress(),request.getPhone(), request.isStatus());
            return cinemaRepository.save(cinema);
        } catch (Exception e) {
            System.out.println(e.getMessage());
        }
        return null;
    }

    public Cinema editCinema(CinemaRequest request, String id){
        try{
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
}
