# 사내 좌석 예약 시스템 — Spring Boot 백엔드

## 스택
| 항목 | 버전 |
|------|------|
| Java | 17 |
| Spring Boot | 3.2.x |
| PostgreSQL | 14+ |
| Flyway | 자동 마이그레이션 |
| 인증 | AD/LDAP (HTTP Basic → Session) |

## 빠른 시작

```bash
# 1. PostgreSQL 준비 (예시: Docker)
docker run -d --name pg \
  -e POSTGRES_DB=seatreserve \
  -e POSTGRES_USER=seatreserve \
  -e POSTGRES_PASSWORD=changeme \
  -p 5432:5432 postgres:16

# 2. 환경변수 설정 (.env 또는 시스템 환경변수)
export LDAP_HOST=ldap.company.com
export LDAP_BASE=dc=company,dc=com
export LDAP_AD_DOMAIN=company.com
export LDAP_BIND_DN=cn=svc-seatreserve,ou=serviceaccounts,dc=company,dc=com
export LDAP_BIND_PW=<서비스계정 비밀번호>

# 3. 빌드 & 실행
./mvnw clean package -DskipTests
java -jar target/seatreserve-api-1.0.0.jar
```

## 필수 환경변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DB_HOST` | PostgreSQL 호스트 | localhost |
| `DB_PORT` | PostgreSQL 포트 | 5432 |
| `DB_NAME` | DB 이름 | seatreserve |
| `DB_USER` | DB 사용자 | seatreserve |
| `DB_PASS` | DB 비밀번호 | changeme |
| `LDAP_HOST` | **AD/LDAP 서버 주소** | ldap.company.com |
| `LDAP_BASE` | **Base DN** | dc=company,dc=com |
| `LDAP_AD_DOMAIN` | **AD 도메인** | company.com |
| `LDAP_BIND_DN` | 서비스 계정 DN | (기본값 교체 필요) |
| `LDAP_BIND_PW` | 서비스 계정 비밀번호 | changeme |
| `LDAP_ADMIN_GROUP` | 관리자 그룹 DN | cn=seatreserve-admins,... |
| `CORS_ORIGINS` | 허용 오리진 | http://localhost:3000 |

## API 엔드포인트

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/me` | 내 정보 (로그인 확인) |
| GET | `/api/seats/status?zoneId=&startDate=&endDate=` | 좌석 현황 |
| POST | `/api/reservations` | 예약 신청 |
| GET | `/api/reservations/my` | 내 예약 목록 |
| DELETE | `/api/reservations/{id}` | 예약 취소 |
| PATCH | `/api/reservations/{id}/actual` | 실사용 인원 등록 |
| GET | `/api/stats/me` | 내 통계·신뢰도 점수 |
| GET | `/api/admin/reservations` | (관리자) 전체/대기 목록 |
| POST | `/api/admin/reservations/{id}/approve` | (관리자) 승인 |
| POST | `/api/admin/reservations/{id}/reject` | (관리자) 반려 |
| GET | `/api/admin/stats` | (관리자) 통계 |
| GET | `/api/admin/pms` | (관리자) PM 어뷰징 모니터링 |

## 인증 방식
- HTTP Basic Auth (ID: sAMAccountName, PW: AD 비밀번호)
- 최초 로그인 시 users 테이블에 자동 생성
- LDAP 그룹 `seatreserve-admins` 멤버 → role=admin 자동 부여

## 사내 배포 절차
1. WAR → WAS(Tomcat) 또는 FAT JAR → systemd 서비스로 등록
2. 앞단에 nginx/Apache 두고 정적 파일(프론트엔드 dist-single/index.html) 함께 서빙
3. PostgreSQL은 내부망 DB 서버에 seatreserve 스키마 생성 후 접속 정보 환경변수에 주입
