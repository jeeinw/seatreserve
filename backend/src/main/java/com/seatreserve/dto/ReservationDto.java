package com.seatreserve.dto;

import com.seatreserve.domain.entity.Reservation;
import lombok.Builder;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.List;

@Builder
public record ReservationDto(
    Long id,
    String pmName,
    String pmUsername,
    String projectName,
    String projectCode,
    LocalDate startDate,
    LocalDate endDate,
    int headcount,
    String reason,
    String status,
    Integer actualHeadcount,
    String rejectReason,
    List<String> seatUids,
    OffsetDateTime createdAt
) {
    public static ReservationDto from(Reservation r) {
        var seats = r.getSeats().stream()
                .map(s -> s.getZone().getId() + "::" + s.getSeatCode())
                .toList();
        return ReservationDto.builder()
                .id(r.getId())
                .pmName(r.getPm().getName())
                .pmUsername(r.getPm().getUsername())
                .projectName(r.getProjectName())
                .projectCode(r.getProjectCode())
                .startDate(r.getStartDate())
                .endDate(r.getEndDate())
                .headcount(r.getHeadcount())
                .reason(r.getReason())
                .status(r.getStatus())
                .actualHeadcount(r.getActualHeadcount())
                .rejectReason(r.getRejectReason())
                .seatUids(seats)
                .createdAt(r.getCreatedAt())
                .build();
    }
}
