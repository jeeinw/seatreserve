package com.seatreserve.domain.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "zones")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Zone {

    @Id
    @Column(length = 64)
    private String id;

    @Column(name = "building_id", nullable = false, length = 64)
    private String buildingId;

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 16)
    private String floor;

    @Column(nullable = false)
    private Integer capacity;
}
