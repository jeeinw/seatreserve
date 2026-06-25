package com.seatreserve.controller;

import com.seatreserve.dto.PmStatsDto;
import com.seatreserve.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/stats")
@RequiredArgsConstructor
public class StatsController {

    private final UserService userService;

    // GET /api/stats/me
    @GetMapping("/me")
    public PmStatsDto myStats(Authentication auth) {
        return userService.getPmStats(auth.getName());
    }
}
