package com.movieticket.cinema.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cinemas")
public class CinemaController {

    @GetMapping("/test")
    public String test() {
        return "Cinema service is working!";
    }
}
