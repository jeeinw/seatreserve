-- ============================================================
-- V1 : 초기 스키마
-- ============================================================

-- 사용자 (AD/LDAP 에서 가져온 속성 캐싱)
CREATE TABLE users (
    id          BIGSERIAL PRIMARY KEY,
    username    VARCHAR(64)  NOT NULL UNIQUE,  -- sAMAccountName
    name        VARCHAR(128) NOT NULL,
    email       VARCHAR(256) NOT NULL,
    role        VARCHAR(16)  NOT NULL DEFAULT 'pm'  -- pm | admin
                CHECK (role IN ('pm','admin')),
    reliability_score SMALLINT NOT NULL DEFAULT 100
                CHECK (reliability_score BETWEEN 0 AND 100),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 건물
CREATE TABLE buildings (
    id      VARCHAR(64)  PRIMARY KEY,
    name    VARCHAR(128) NOT NULL
);

-- 존 (Zone)
CREATE TABLE zones (
    id          VARCHAR(64)  PRIMARY KEY,
    building_id VARCHAR(64)  NOT NULL REFERENCES buildings(id),
    name        VARCHAR(128) NOT NULL,
    floor       VARCHAR(16)  NOT NULL,
    capacity    INT          NOT NULL CHECK (capacity > 0)
);

-- 좌석
CREATE TABLE seats (
    id          BIGSERIAL    PRIMARY KEY,
    zone_id     VARCHAR(64)  NOT NULL REFERENCES zones(id),
    seat_code   VARCHAR(32)  NOT NULL,               -- A-01, B-001 …
    UNIQUE (zone_id, seat_code)
);

-- 프로젝트 (예약 요청 단위)
CREATE TABLE reservations (
    id              BIGSERIAL    PRIMARY KEY,
    pm_id           BIGINT       NOT NULL REFERENCES users(id),
    project_name    VARCHAR(256) NOT NULL,
    project_code    VARCHAR(64)  NOT NULL,
    start_date      DATE         NOT NULL,
    end_date        DATE         NOT NULL,
    headcount       INT          NOT NULL CHECK (headcount > 0),
    reason          TEXT,
    status          VARCHAR(16)  NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending','approved','rejected','cancelled')),
    actual_headcount INT,
    approved_by     BIGINT       REFERENCES users(id),
    approved_at     TIMESTAMPTZ,
    reject_reason   TEXT,
    created_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    CONSTRAINT date_order CHECK (end_date >= start_date)
);

-- 예약 ↔ 좌석 연결 (다대다)
CREATE TABLE reservation_seats (
    reservation_id  BIGINT NOT NULL REFERENCES reservations(id) ON DELETE CASCADE,
    seat_id         BIGINT NOT NULL REFERENCES seats(id),
    PRIMARY KEY (reservation_id, seat_id)
);

-- 감사 로그
CREATE TABLE audit_logs (
    id          BIGSERIAL    PRIMARY KEY,
    actor_id    BIGINT       REFERENCES users(id),
    action      VARCHAR(64)  NOT NULL,
    target_type VARCHAR(64),
    target_id   BIGINT,
    detail      TEXT,
    ip_address  VARCHAR(64),
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 인덱스
CREATE INDEX idx_reservations_pm      ON reservations(pm_id);
CREATE INDEX idx_reservations_status  ON reservations(status);
CREATE INDEX idx_reservations_dates   ON reservations(start_date, end_date);
CREATE INDEX idx_reservation_seats    ON reservation_seats(seat_id);
CREATE INDEX idx_audit_logs_actor     ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_created   ON audit_logs(created_at DESC);
