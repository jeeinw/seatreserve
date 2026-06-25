package com.seatreserve.controller;

import com.seatreserve.dto.AdminStatsDto;
import com.seatreserve.dto.ReservationDto;
import com.seatreserve.dto.UserDto;
import com.seatreserve.service.ReservationService;
import com.seatreserve.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final ReservationService reservationService;
    private final UserService userService;

    // GET /api/admin/reservations?status=pending&page=0&size=20
    @GetMapping("/reservations")
    public Page<ReservationDto> list(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return status != null && status.equals("pending")
                ? reservationService.getPending(pageable)
                : reservationService.getAll(pageable);
    }

    // POST /api/admin/reservations/{id}/approve
    @PostMapping("/reservations/{id}/approve")
    public ReservationDto approve(Authentication auth, @PathVariable Long id) {
        return reservationService.approve(auth.getName(), id);
    }

    // POST /api/admin/reservations/{id}/reject
    @PostMapping("/reservations/{id}/reject")
    public ReservationDto reject(Authentication auth,
                                 @PathVariable Long id,
                                 @RequestBody Map<String, String> body) {
        return reservationService.reject(auth.getName(), id, body.get("reason"));
    }

    // GET /api/admin/stats
    @GetMapping("/stats")
    public AdminStatsDto stats() {
        return userService.getAdminStats();
    }

    // GET /api/admin/pms — PM 어뷰징 모니터링
    @GetMapping("/pms")
    public List<UserDto> pms() {
        return userService.getAllPms();
    }
}
