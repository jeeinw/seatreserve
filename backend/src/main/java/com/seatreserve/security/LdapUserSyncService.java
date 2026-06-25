package com.seatreserve.security;

import com.seatreserve.domain.entity.User;
import com.seatreserve.domain.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.ldap.core.LdapTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.ldap.userdetails.LdapUserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;

/**
 * LDAP 로그인 성공 시 users 테이블에 사용자 정보를 동기화한다.
 * 처음 로그인하면 INSERT, 이후에는 name·email 갱신.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LdapUserSyncService {

    private final UserRepository userRepository;
    private final LdapTemplate ldapTemplate;

    @Value("${app.ldap.admin-group-dn}")
    private String adminGroupDn;

    @Transactional
    public User syncUser(Authentication auth) {
        String username = auth.getName();
        boolean isAdmin = isAdminMember(auth);

        return userRepository.findByUsername(username).map(u -> {
            u.setRole(isAdmin ? "admin" : "pm");
            return userRepository.save(u);
        }).orElseGet(() -> {
            // LDAP에서 name/email 조회 (구현 환경에 따라 attribute명 조정)
            String[] attrs = fetchAttrs(username);
            var user = User.builder()
                    .username(username)
                    .name(attrs[0])
                    .email(attrs[1])
                    .role(isAdmin ? "admin" : "pm")
                    .reliabilityScore((short) 100)
                    .build();
            log.info("신규 사용자 등록: {}", username);
            return userRepository.save(user);
        });
    }

    private boolean isAdminMember(Authentication auth) {
        Collection<?> authorities = auth.getAuthorities();
        return authorities.stream()
                .anyMatch(a -> a.toString().contains("seatreserve-admins"));
    }

    private String[] fetchAttrs(String username) {
        // AD 환경에서 displayName, mail 속성 조회
        // 실제 환경의 attribute 이름이 다르면 여기를 수정하세요
        try {
            return ldapTemplate.lookup(
                "uid=" + username,
                new String[]{"displayName", "mail"},
                ctx -> new String[]{
                    (String) ctx.getStringAttribute("displayName"),
                    (String) ctx.getStringAttribute("mail")
                }
            );
        } catch (Exception e) {
            log.warn("LDAP 속성 조회 실패 ({}), 기본값 사용", username, e);
            return new String[]{username, username + "@company.com"};
        }
    }
}
