package com.seatreserve.domain.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(name = "users")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class User {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 64)
    private String username;          // sAMAccountName

    @Column(nullable = false, length = 128)
    private String name;

    @Column(nullable = false, length = 256)
    private String email;

    @Column(nullable = false, length = 16)
    private String role = "pm";       // pm | admin

    @Column(nullable = false)
    private Short reliabilityScore = 100;

    @Column(nullable = false, updatable = false)
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @UpdateTimestamp
    private OffsetDateTime updatedAt;
}
