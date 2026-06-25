package com.seatreserve.controller;

import com.seatreserve.dto.ReservationDto;
import com.seatreserve.dto.ReservationRequest;
import com.seatreserve.service.ReservationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    // POST /api/reservations
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ReservationDto create(Authentication auth,
                                 @Valid @RequestBody ReservationRequest req) {
        return reservationService.create(auth.getName(), req);
    }

    // GET /api/reservations/my
    @GetMapping("/my")
    public List<ReservationDto> myReservations(Authentication auth) {
        return reservationService.getMyReservations(auth.getName());
    }

    // DELETE /api/reservations/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancel(Authentication auth, @PathVariable Long id) {
        reservationService.cancel(auth.getName(), id);
    }

    // PATCH /api/reservations/{id}/actual
    @PatchMapping("/{id}/actual")
    public void updateActual(Authentication auth,
                             @PathVariable Long id,
                             @RequestBody Map<String, Integer> body) {
        reservationService.updateActualUsage(auth.getName(), id, body.get("actualHeadcount"));
    }
}
