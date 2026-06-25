package com.seatreserve.dto;

import java.time.LocalDate;
import java.util.Map;

public record SeatStatusResponse(
    String zoneId,
    LocalDate startDate,
    LocalDate endDate,
    Map<String, SeatInfo> seats   // key = seatCode
) {
    public record SeatInfo(
        String status,       // available | reserved | pending
        String pmName,
        String projectName,
        Long reservationId
    ) {}
}
