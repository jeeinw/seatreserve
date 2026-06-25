-- ============================================================
-- V2 : 건물·존 기준 데이터
-- ============================================================
INSERT INTO buildings (id, name) VALUES
    ('bonsa',       '본사'),
    ('baejae-mgmt', '배재관리동'),
    ('baejae-9f',   '배재빌딩 9층'),
    ('baejae-10f',  '배재빌딩 10층'),
    ('semicolon',   '세미콜론 12층'),
    ('westgate',    '웨스트게이트 7층');

INSERT INTO zones (id, building_id, name, floor, capacity) VALUES
    ('bonsa-6f-a',       'bonsa',       '본사 6층 A존',             '6F',  30),
    ('baejae-mgmt-6f-e', 'baejae-mgmt', '배재관리동 6층 E존',        '6F',  42),
    ('baejae-9f-c',      'baejae-9f',   '배재 9층 C존',              '9F',  20),
    ('baejae-9f-d',      'baejae-9f',   '배재 9층 D존',              '9F',  21),
    ('baejae-9f-n',      'baejae-9f',   '배재 9층 N존',              '9F',  64),
    ('baejae-10f-a1',    'baejae-10f',  '배재 10층 A-1존',           '10F', 33),
    ('baejae-10f-a2',    'baejae-10f',  '배재 10층 A-2존',           '10F', 30),
    ('baejae-10f-b',     'baejae-10f',  '배재 10층 B존',             '10F', 48),
    ('semicolon-12f',    'semicolon',   '세미콜론 12층 (Tech&BAU)',   '12F', 187),
    ('westgate-7f-f',    'westgate',    '웨스트게이트 7층 F존',       '7F',  61),
    ('westgate-7f-g',    'westgate',    '웨스트게이트 7층 G존',       '7F',  62),
    ('westgate-7f-n',    'westgate',    '웨스트게이트 7층 N존',       '7F',  32);
