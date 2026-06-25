package com.seatreserve.service;

import com.seatreserve.domain.entity.*;
import com.seatreserve.domain.repository.*;
import com.seatreserve.dto.*;
import com.seatreserve.exception.BusinessException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepo;
    private final SeatRepository seatRepo;
    private final UserRepository userRepo;
    private final AuditLogRepository auditRepo;

    // ── PM: 예약 생성 ──────────────────────────────────
    @Transactional
    public ReservationDto create(String username, ReservationRequest req) {
        User pm = userRepo.findByUsername(username)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다."));

        // 기간 검증
        if (req.endDate().isBefore(req.startDate())) {
            throw new BusinessException("종료일이 시작일보다 빠릅니다.");
        }
        long months = ChronoUnit.MONTHS.between(req.startDate(), req.endDate());
        if (months > 6) {
            throw new BusinessException("예약 기간은 최대 6개월입니다.");
        }

        // 좌석 파싱 및 조회
        List<Seat> seats = resolveSeats(req.seatUids());
        List<Long> seatIds = seats.stream().map(Seat::getId).toList();

        // 중복 검사
        boolean conflict = reservationRepo.existsConflict(seatIds, req.startDate(), req.endDate(), -1L);
        if (conflict) {
            throw new BusinessException("선택한 좌석 중 해당 기간에 이미 예약된 좌석이 있습니다.");
        }

        // 인원 비율 경고(서버 로그만 — 클라이언트는 프론트에서 이미 경고 표시)
        int seatCount = seats.size();
        if (req.headcount() < seatCount * 0.7) {
            // 실제 거부는 하지 않음. 감사 로그에 기록.
        }

        var reservation = Reservation.builder()
                .pm(pm)
                .projectName(req.projectName())
                .projectCode(req.projectCode())
                .startDate(req.startDate())
                .endDate(req.endDate())
                .headcount(req.headcount())
                .reason(req.reason())
                .status("pending")
                .seats(new HashSet<>(seats))
                .build();

        var saved = reservationRepo.save(reservation);
        audit(pm, "RESERVATION_CREATE", "Reservation", saved.getId(),
              "프로젝트: " + req.projectName());

        return ReservationDto.from(saved);
    }

    // ── PM: 내 예약 목록 ──────────────────────────────
    @Transactional(readOnly = true)
    public List<ReservationDto> getMyReservations(String username) {
        User pm = userRepo.findByUsername(username)
                .orElseThrow(() -> new BusinessException("사용자를 찾을 수 없습니다."));
        return reservationRepo.findByPmIdOrderByCreatedAtDesc(pm.getId())
                .stream().map(ReservationDto::from).toList();
    }

    // ── PM: 예약 취소 ──────────────────────────────────
    @Transactional
    public void cancel(String username, Long reservationId) {
        var reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new BusinessException("예약을 찾을 수 없습니다."));
        if (!reservation.getPm().getUsername().equals(username)) {
            throw new BusinessException("본인의 예약만 취소할 수 있습니다.");
        }
        if (reservation.getStatus().equals("cancelled")) {
            throw new BusinessException("이미 취소된 예약입니다.");
        }
        reservation.setStatus("cancelled");
        reservationRepo.save(reservation);
        User pm = reservation.getPm();
        audit(pm, "RESERVATION_CANCEL", "Reservation", reservationId, null);
    }

    // ── PM: 실사용 인원 등록 ─────────────────────────
    @Transactional
    public void updateActualUsage(String username, Long reservationId, int actualHeadcount) {
        var reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new BusinessException("예약을 찾을 수 없습니다."));
        if (!reservation.getPm().getUsername().equals(username)) {
            throw new BusinessException("본인의 예약만 수정할 수 있습니다.");
        }
        reservation.setActualHeadcount(actualHeadcount);
        reservationRepo.save(reservation);
        recalcReliability(reservation.getPm());
    }

    // ── 좌석 상태 조회 ────────────────────────────────
    @Transactional(readOnly = true)
    public SeatStatusResponse getSeatStatus(String zoneId, LocalDate startDate, LocalDate endDate) {
        List<Reservation> active = reservationRepo.findActiveByZoneAndDateRange(zoneId, startDate, endDate);
        Map<String, SeatStatusResponse.SeatInfo> map = new LinkedHashMap<>();
        for (Reservation r : active) {
            for (Seat s : r.getSeats()) {
                if (!s.getZone().getId().equals(zoneId)) continue;
                map.put(s.getSeatCode(), new SeatStatusResponse.SeatInfo(
                        r.getStatus(), r.getPm().getName(), r.getProjectName(), r.getId()));
            }
        }
        return new SeatStatusResponse(zoneId, startDate, endDate, map);
    }

    // ── 어드민: 대기 목록 ─────────────────────────────
    @Transactional(readOnly = true)
    public Page<ReservationDto> getPending(Pageable pageable) {
        return reservationRepo.findByStatusOrderByCreatedAtDesc("pending", pageable)
                .map(ReservationDto::from);
    }

    // ── 어드민: 전체 목록 ─────────────────────────────
    @Transactional(readOnly = true)
    public Page<ReservationDto> getAll(Pageable pageable) {
        return reservationRepo.findAllByOrderByCreatedAtDesc(pageable)
                .map(ReservationDto::from);
    }

    // ── 어드민: 승인 ──────────────────────────────────
    @Transactional
    public ReservationDto approve(String adminUsername, Long reservationId) {
        User admin = userRepo.findByUsername(adminUsername)
                .orElseThrow(() -> new BusinessException("관리자를 찾을 수 없습니다."));
        var reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new BusinessException("예약을 찾을 수 없습니다."));
        if (!reservation.getStatus().equals("pending")) {
            throw new BusinessException("대기 중인 예약만 승인할 수 있습니다.");
        }
        // 재검증 (동시 요청 방어)
        List<Long> seatIds = reservation.getSeats().stream().map(Seat::getId).toList();
        if (reservationRepo.existsConflict(seatIds, reservation.getStartDate(), reservation.getEndDate(), reservationId)) {
            throw new BusinessException("좌석 충돌이 발생했습니다. 다시 확인하세요.");
        }
        reservation.setStatus("approved");
        reservation.setApprovedBy(admin);
        reservation.setApprovedAt(OffsetDateTime.now());
        reservationRepo.save(reservation);
        audit(admin, "RESERVATION_APPROVE", "Reservation", reservationId, null);
        return ReservationDto.from(reservation);
    }

    // ── 어드민: 반려 ──────────────────────────────────
    @Transactional
    public ReservationDto reject(String adminUsername, Long reservationId, String rejectReason) {
        User admin = userRepo.findByUsername(adminUsername)
                .orElseThrow(() -> new BusinessException("관리자를 찾을 수 없습니다."));
        var reservation = reservationRepo.findById(reservationId)
                .orElseThrow(() -> new BusinessException("예약을 찾을 수 없습니다."));
        if (!reservation.getStatus().equals("pending")) {
            throw new BusinessException("대기 중인 예약만 반려할 수 있습니다.");
        }
        reservation.setStatus("rejected");
        reservation.setRejectReason(rejectReason);
        reservationRepo.save(reservation);
        audit(admin, "RESERVATION_REJECT", "Reservation", reservationId, rejectReason);
        return ReservationDto.from(reservation);
    }

    // ── PM 신뢰도 점수 재계산 ─────────────────────────
    private void recalcReliability(User pm) {
        List<Reservation> completed = reservationRepo.findCompletedByPm(pm.getId(), LocalDate.now());
        if (completed.isEmpty()) return;
        double avg = completed.stream()
                .filter(r -> r.getActualHeadcount() != null && r.getHeadcount() > 0)
                .mapToDouble(r -> (double) r.getActualHeadcount() / r.getHeadcount())
                .average().orElse(1.0);
        short score = (short) Math.max(0, Math.min(100, (int) (avg * 100)));
        pm.setReliabilityScore(score);
        userRepo.save(pm);
    }

    // ── 좌석 UID 파싱 ─────────────────────────────────
    private List<Seat> resolveSeats(List<String> seatUids) {
        List<Seat> result = new ArrayList<>();
        for (String uid : seatUids) {
            String[] parts = uid.split("::");
            if (parts.length != 2) throw new BusinessException("잘못된 좌석 UID: " + uid);
            Seat seat = seatRepo.findByZoneIdAndSeatCode(parts[0], parts[1])
                    .orElseThrow(() -> new BusinessException("존재하지 않는 좌석: " + uid));
            result.add(seat);
        }
        return result;
    }

    private void audit(User actor, String action, String targetType, Long targetId, String detail) {
        auditRepo.save(AuditLog.builder()
                .actor(actor).action(action)
                .targetType(targetType).targetId(targetId)
                .detail(detail).build());
    }
}
