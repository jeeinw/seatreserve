package com.seatreserve.domain.repository;

import com.seatreserve.domain.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ZoneRepository extends JpaRepository<Zone, String> {
    List<Zone> findByBuildingId(String buildingId);
}
