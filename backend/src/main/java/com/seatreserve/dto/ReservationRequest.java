package com.seatreserve.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public record ReservationRequest(
    @NotBlank String projectName,
    @NotBlank String projectCode,
    @NotNull  LocalDate startDate,
    @NotNull  LocalDate endDate,
    @Min(1)   int headcount,
    String reason,
    @NotEmpty List<String> seatUids   // "{zoneId}::{seatCode}" 형식
) {}
