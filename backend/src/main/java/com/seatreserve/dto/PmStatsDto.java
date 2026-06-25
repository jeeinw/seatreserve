package com.seatreserve.dto;

public record PmStatsDto(
    long totalReservations,
    long pendingCount,
    long approvedCount,
    long cancelledCount,
    short reliabilityScore
) {}
