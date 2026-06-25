package com.seatreserve.controller;

import com.seatreserve.dto.UserDto;
import com.seatreserve.security.LdapUserSyncService;
import com.seatreserve.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class AuthController {

    private final LdapUserSyncService syncService;
    private final UserService userService;

    // 프론트엔드가 GET /api/me 를 호출하면 LDAP 인증 → DB 동기화 → 사용자 정보 반환
    @GetMapping("/me")
    public UserDto getMe(Authentication auth) {
        syncService.syncUser(auth);
        return userService.getMe(auth.getName());
    }
}
