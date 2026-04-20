package com.movieticket.cinema.repository;

import com.movieticket.cinema.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoomRepository extends JpaRepository<Room,String> {
}
