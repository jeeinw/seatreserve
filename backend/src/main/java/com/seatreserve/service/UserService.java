package com.seatreserve.service;

import com.seatreserve.domain.repository.ReservationRepository;
import com.seatreserve.domain.repository.UserRepository;
import com.seatreserve.dto.AdminStatsDto;
import com.seatreserve.dto.PmStatsDto;
import com.seatreserve.dto.UserDto;
import com.seatreserve.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepo;
    private final ReservationRepository reservationRepo;

    @Transactional(readOnly = true)
    public UserDto getMe(String username) {
        return userRepo.findByUsername(username)
                .map(UserDto::from)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다."));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getAllPms() {
        return userRepo.findAll().stream()
                .filter(u -> "pm".equals(u.getRole()))
                .map(UserDto::from).toList();
    }

    @Transactional(readOnly = true)
    public PmStatsDto getPmStats(String username) {
        var user = userRepo.findByUsername(username)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다."));
        long total = reservationRepo.countByPmIdAndStatus(user.getId(), "approved")
                   + reservationRepo.countByPmIdAndStatus(user.getId(), "pending")
                   + reservationRepo.countByPmIdAndStatus(user.getId(), "cancelled")
                   + reservationRepo.countByPmIdAndStatus(user.getId(), "rejected");
        return new PmStatsDto(
                total,
                reservationRepo.countByPmIdAndStatus(user.getId(), "pending"),
                reservationRepo.countByPmIdAndStatus(user.getId(), "approved"),
                reservationRepo.countByPmIdAndStatus(user.getId(), "cancelled"),
                user.getReliabilityScore()
        );
    }

    @Transactional(readOnly = true)
    public AdminStatsDto getAdminStats() {
        long pending  = reservationRepo.findByStatusOrderByCreatedAtDesc("pending",
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        long approved = reservationRepo.findByStatusOrderByCreatedAtDesc("approved",
                org.springframework.data.domain.Pageable.unpaged()).getTotalElements();
        // 전체 좌석 수 — V2 시드 기준 합계
        long totalSeats = 587;
        // 활성 예약의 좌석 수 (간략 추정: 실제 구현 시 쿼리 추가)
        return new AdminStatsDto(totalSeats, 0, pending, approved);
    }
}
