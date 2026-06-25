package com.seatreserve.dto;

public record AdminStatsDto(
    long totalSeats,
    long occupiedSeats,
    long pendingCount,
    long approvedCount
) {}
