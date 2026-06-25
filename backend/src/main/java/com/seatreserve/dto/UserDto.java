package com.seatreserve.dto;

import com.seatreserve.domain.entity.User;
import lombok.Builder;

@Builder
public record UserDto(Long id, String username, String name, String email,
                      String role, Short reliabilityScore) {
    public static UserDto from(User u) {
        return UserDto.builder()
                .id(u.getId()).username(u.getUsername())
                .name(u.getName()).email(u.getEmail())
                .role(u.getRole()).reliabilityScore(u.getReliabilityScore())
                .build();
    }
}
