package com.seatreserve.domain.repository;

import com.seatreserve.domain.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByZoneId(String zoneId);

    Optional<Seat> findByZoneIdAndSeatCode(String zoneId, String seatCode);

    @Query("SELECT s FROM Seat s WHERE s.zone.id = :zoneId AND s.seatCode IN :codes")
    List<Seat> findByZoneIdAndSeatCodeIn(@Param("zoneId") String zoneId,
                                          @Param("codes") List<String> codes);
}
