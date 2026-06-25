package com.seatreserve.controller;

import com.seatreserve.dto.SeatStatusResponse;
import com.seatreserve.service.ReservationService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/seats")
@RequiredArgsConstructor
public class SeatController {

    private final ReservationService reservationService;

    // GET /api/seats/status?zoneId=&startDate=&endDate=
    @GetMapping("/status")
    public SeatStatusResponse getStatus(
            @RequestParam String zoneId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return reservationService.getSeatStatus(zoneId, startDate, endDate);
    }
}
