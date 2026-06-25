package com.seatreserve.domain.repository;

import com.seatreserve.domain.entity.Reservation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByPmIdOrderByCreatedAtDesc(Long pmId);

    Page<Reservation> findByStatusOrderByCreatedAtDesc(String status, Pageable pageable);

    Page<Reservation> findAllByOrderByCreatedAtDesc(Pageable pageable);

    // 날짜 범위 내 승인된 예약에 특정 좌석이 포함되는지 확인 (중복 검사)
    @Query("""
        SELECT COUNT(r) > 0 FROM Reservation r
        JOIN r.seats s
        WHERE s.id IN :seatIds
          AND r.status IN ('approved', 'pending')
          AND r.startDate <= :endDate
          AND r.endDate >= :startDate
          AND r.id <> :excludeId
        """)
    boolean existsConflict(@Param("seatIds") List<Long> seatIds,
                           @Param("startDate") LocalDate startDate,
                           @Param("endDate") LocalDate endDate,
                           @Param("excludeId") Long excludeId);

    // 특정 존·기간 내 좌석 상태 조회용
    @Query("""
        SELECT r FROM Reservation r
        JOIN FETCH r.seats s
        JOIN FETCH r.pm
        WHERE s.zone.id = :zoneId
          AND r.status IN ('approved', 'pending')
          AND r.startDate <= :endDate
          AND r.endDate >= :startDate
        """)
    List<Reservation> findActiveByZoneAndDateRange(@Param("zoneId") String zoneId,
                                                    @Param("startDate") LocalDate startDate,
                                                    @Param("endDate") LocalDate endDate);

    // PM 신뢰도 점수 계산용 — 승인된 예약 중 실사용인원 기록된 건
    @Query("""
        SELECT r FROM Reservation r
        WHERE r.pm.id = :pmId
          AND r.status = 'approved'
          AND r.endDate < :today
        """)
    List<Reservation> findCompletedByPm(@Param("pmId") Long pmId,
                                         @Param("today") LocalDate today);

    long countByPmIdAndStatus(Long pmId, String status);
}
