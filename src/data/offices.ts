import type { Zone, Building, GridCell } from '@/types'

// Helper: generate simple grid rows from a flat seat list
function grid(cols: number, seats: string[]): GridCell[][] {
  const rows: GridCell[][] = []
  for (let i = 0; i < seats.length; i += cols) {
    rows.push(seats.slice(i, i + cols))
  }
  return rows
}

// ─────────────────────────────────────────────
// 1. 본사 6층 A존  (30석)
//    A-01 ~ A-30
// ─────────────────────────────────────────────
const bonsa6A: Zone = {
  id: 'bonsa-6f-a',
  name: '본사 6층 A존',
  building: 'bonsa',
  floor: '6F',
  capacity: 30,
  rows: [
    // Group 1 (3 desk pods)
    ['A-01', 'A-07', null, 'A-13', 'A-19', null, 'A-25'],
    ['A-02', 'A-08', null, 'A-14', 'A-20', null, 'A-26'],
    ['A-03', 'A-09', null, 'A-15', 'A-21', null, 'A-27'],
    [null, null, null, null, null, null, null],
    ['A-04', 'A-10', null, 'A-16', 'A-22', null, 'A-28'],
    ['A-05', 'A-11', null, 'A-17', 'A-23', null, 'A-29'],
    ['A-06', 'A-12', null, 'A-18', 'A-24', null, 'A-30'],
  ],
}

// ─────────────────────────────────────────────
// 2. 배재관리동 6층 E존  (42석)
//    E-01 ~ E-42
// ─────────────────────────────────────────────
const baejae6E: Zone = {
  id: 'baejae-mgmt-6f-e',
  name: '배재관리동 6층 E존',
  building: 'baejae-mgmt',
  floor: '6F',
  capacity: 42,
  rows: [
    // Group A (8석)
    ['E-01', 'E-02', 'E-03', 'E-04', null, null, null, null],
    ['E-05', 'E-06', 'E-07', 'E-08', null, null, null, null],
    [null, null, null, null, null, null, null, null],
    // Group B (16석)
    ['E-09', 'E-10', 'E-11', 'E-12', null, 'E-27', 'E-28', 'E-29', 'E-30'],
    ['E-13', 'E-14', 'E-15', 'E-16', null, 'E-31', 'E-32', 'E-33', 'E-34'],
    [null, null, null, null, null, null, null, null, null],
    // Group C (18석)
    ['E-17', 'E-18', 'E-19', 'E-20', 'E-21', null, 'E-35', 'E-36', 'E-37', 'E-38'],
    ['E-22', 'E-23', 'E-24', 'E-25', 'E-26', null, 'E-39', 'E-40', 'E-41', 'E-42'],
  ],
}

// ─────────────────────────────────────────────
// 3. 배재 9층 C존  (20석)
//    C-01 ~ C-20
// ─────────────────────────────────────────────
const baejae9C: Zone = {
  id: 'baejae-9f-c',
  name: '배재 9층 C존',
  building: 'baejae-9f',
  floor: '9F',
  capacity: 20,
  rows: [
    ['C-01', 'C-02', 'C-03', 'C-04', 'C-05'],
    ['C-06', 'C-07', 'C-08', 'C-09', 'C-10'],
    [null, null, null, null, null],
    ['C-11', 'C-12', 'C-13', 'C-14', 'C-15'],
    ['C-16', 'C-17', 'C-18', 'C-19', 'C-20'],
  ],
}

// ─────────────────────────────────────────────
// 4. 배재 9층 D존  (21석)
//    D-01 ~ D-21
// ─────────────────────────────────────────────
const baejae9D: Zone = {
  id: 'baejae-9f-d',
  name: '배재 9층 D존',
  building: 'baejae-9f',
  floor: '9F',
  capacity: 21,
  rows: [
    ['D-01', 'D-02', 'D-03', null, 'D-04', 'D-05', 'D-06'],
    ['D-07', 'D-08', 'D-09', null, 'D-10', 'D-11', 'D-12'],
    [null, null, null, null, null, null, null],
    ['D-13', 'D-14', 'D-15', null, 'D-16', 'D-17', 'D-18'],
    ['D-19', 'D-20', 'D-21', null, null, null, null],
  ],
}

// ─────────────────────────────────────────────
// 5. 배재 9층 N존  (64석)
//    N-01 ~ N-64
// ─────────────────────────────────────────────
const baejae9N: Zone = {
  id: 'baejae-9f-n',
  name: '배재 9층 N존',
  building: 'baejae-9f',
  floor: '9F',
  capacity: 64,
  rows: [
    // Upper section (30석)
    ['N-01', 'N-11', null, 'N-21', 'N-30', null, 'N-40', 'N-50'],
    ['N-02', 'N-12', null, 'N-22', 'N-31', null, 'N-41', 'N-51'],
    ['N-03', 'N-13', null, 'N-23', 'N-32', null, 'N-42', 'N-52'],
    ['N-04', 'N-14', null, 'N-24', 'N-33', null, 'N-43', 'N-53'],
    ['N-05', 'N-15', null, 'N-25', 'N-34', null, 'N-44', 'N-54'],
    [null, null, null, null, null, null, null, null],
    // Lower section (34석)
    ['N-06', 'N-16', null, 'N-26', 'N-35', null, 'N-45', 'N-55', null, 'N-60'],
    ['N-07', 'N-17', null, 'N-27', 'N-36', null, 'N-46', 'N-56', null, 'N-61'],
    ['N-08', 'N-18', null, 'N-28', 'N-37', null, 'N-47', 'N-57', null, 'N-62'],
    ['N-09', 'N-19', null, null,   'N-38', null, 'N-48', 'N-58', null, 'N-63'],
    ['N-10', 'N-20', null, 'N-29', 'N-39', null, 'N-49', 'N-59', null, 'N-64'],
  ],
}

// ─────────────────────────────────────────────
// 6. 배재 10층 A-1존  (33석)
//    A-01 ~ A-33
// ─────────────────────────────────────────────
const baejae10A1: Zone = {
  id: 'baejae-10f-a1',
  name: '배재 10층 A-1존',
  building: 'baejae-10f',
  floor: '10F',
  capacity: 33,
  rows: [
    // Top block (2 col × 5 row = 10)
    ['A-01', 'A-06', null, 'LABEL:회의실'],
    ['A-02', 'A-07', null, null],
    ['A-03', 'A-08', null, null],
    ['A-04', 'A-09', null, null],
    ['A-05', 'A-10', null, null],
    [null, null, null, null],
    // Middle block
    ['A-11', 'A-15', null, 'A-20', 'A-25'],
    ['A-12', 'A-16', null, 'A-21', 'A-26'],
    ['A-13', 'A-17', null, 'A-22', 'A-27'],
    [null,   'A-18', null, 'A-23', 'A-28'],
    ['A-14', 'A-19', null, 'A-24', 'A-29'],
    [null, null, null, null, null],
    // Bottom block
    ['A-30', 'A-31', 'A-32'],
    ['A-33', null,   null],
  ],
}

// ─────────────────────────────────────────────
// 7. 배재 10층 A-2존  (30석)
//    A-34 ~ A-63
// ─────────────────────────────────────────────
const baejae10A2: Zone = {
  id: 'baejae-10f-a2',
  name: '배재 10층 A-2존',
  building: 'baejae-10f',
  floor: '10F',
  capacity: 30,
  rows: [
    // Top block
    ['A-34', 'A-35', 'A-36', null, 'A-40', 'A-41'],
    ['A-37', 'A-38', 'A-39', null, 'A-42', 'A-43'],
    [null, null, null, null, null, null],
    // Middle block
    ['A-44', 'A-45', 'A-46', null, 'A-50', 'A-51'],
    ['A-47', 'A-48', 'A-49', null, 'A-52', 'A-53'],
    [null, null, null, null, null, null],
    // Bottom block
    ['A-54', 'A-55', 'A-56', null, 'A-60', 'A-61'],
    ['A-57', 'A-58', 'A-59', null, 'A-62', 'A-63'],
  ],
}

// ─────────────────────────────────────────────
// 8. 배재 10층 B존  (48석)
//    B-01 ~ B-48
// ─────────────────────────────────────────────
const baejae10B: Zone = {
  id: 'baejae-10f-b',
  name: '배재 10층 B존',
  building: 'baejae-10f',
  floor: '10F',
  capacity: 48,
  rows: [
    ['B-01', 'B-02', 'B-03', 'B-04', null, 'B-09', 'B-10', 'B-11', 'B-12'],
    ['B-05', 'B-06', 'B-07', 'B-08', null, 'B-13', 'B-14', 'B-15', 'B-16'],
    [null, null, null, null, null, null, null, null, null],
    ['B-17', 'B-18', 'B-19', 'B-20', null, 'B-25', 'B-26', 'B-27', 'B-28'],
    ['B-21', 'B-22', 'B-23', 'B-24', null, 'B-29', 'B-30', 'B-31', 'B-32'],
    [null, null, null, null, null, null, null, null, null],
    ['B-33', 'B-34', 'B-35', 'B-36', null, 'B-41', 'B-42', 'B-43', 'B-44'],
    ['B-37', 'B-38', 'B-39', 'B-40', null, 'B-45', 'B-46', 'B-47', 'B-48'],
  ],
}

// ─────────────────────────────────────────────
// 9. 세미콜론 12층  (Tech Project & BAU, 187석)
//    도면 그대로 (가로/landscape) 재현
//    B존 B-001 ~ B-128 (128석),  C존 C-001 ~ C-059 (59석)
//    좌측: 회의실 ×2 + 캔틴1,  상단: Main Gate,
//    중앙: 회의실 ×2,  우측: 회의실2
// ─────────────────────────────────────────────
function buildSemicolon(): GridCell[][] {
  const H = 14
  const W = 48
  const g: GridCell[][] = Array.from({ length: H }, () => Array<GridCell>(W).fill(null))

  // place a label at a single cell
  const lbl = (r: number, c: number, t: string) => { g[r][c] = 'LABEL:' + t }
  // place codes top→down in one sub-column
  const dn = (r: number, c: number, codes: string[]) =>
    codes.forEach((code, i) => { g[r + i][c] = code })
  // place codes left→right in one row (null = skip)
  const ac = (r: number, c: number, codes: (string | null)[]) =>
    codes.forEach((code, i) => { if (code !== null) g[r][c + i] = code })

  // ── 상단 우측: C존 C-001 ~ C-029 ──
  ac(0, 30, ['C-001', 'C-002', 'C-003', null, 'C-004', 'C-005', 'C-006'])
  ac(1, 30, ['C-007', 'C-008', 'C-009', null, 'C-010', 'C-011', 'C-012'])
  ac(2, 30, ['C-013', 'C-014', 'C-015', null, 'C-016', 'C-017', 'C-018'])
  ac(3, 30, ['C-019', 'C-020', 'C-021', null, 'C-022', 'C-023', 'C-024'])
  ac(4, 30, ['C-025', 'C-026', 'C-027', null, 'C-028', 'C-029'])

  // ── 상단 중앙: 출입구 ──
  lbl(5, 12, 'Main Gate')

  // ── 좌측 룸: 회의실 ×2 + 캔틴1 ──
  lbl(6, 1, '회의실')
  lbl(6, 3, '회의실')
  lbl(10, 1, '캔틴1')

  // ── 상단 좌/중앙: B존 윗줄 (B-001 ~ B-056) ──
  dn(6, 6, ['B-001', 'B-002', 'B-003']); dn(6, 7, ['B-007', 'B-008', 'B-009'])
  dn(6, 9, ['B-013', 'B-014', 'B-015']); dn(6, 10, ['B-020', 'B-021', 'B-022'])
  dn(6, 12, ['B-027', 'B-028']);         dn(6, 13, ['B-033', 'B-034'])
  dn(6, 15, ['B-039', 'B-040']);         dn(6, 16, ['B-044', 'B-045'])
  dn(6, 18, ['B-049', 'B-050']);         dn(6, 19, ['B-055', 'B-056'])

  // ── 중앙 회의실 ×2 ──
  lbl(7, 21, '회의실')
  lbl(7, 24, '회의실')

  // ── 중앙 우측: C존 C-030 ~ C-059 ──
  dn(6, 27, ['C-030', 'C-031', 'C-032']);          dn(6, 28, ['C-033', 'C-034', 'C-035'])
  dn(6, 30, ['C-036', 'C-037', 'C-038', 'C-039']); dn(6, 31, ['C-040', 'C-041', 'C-042', 'C-043'])
  dn(6, 33, ['C-044', 'C-045', 'C-046', 'C-047']); dn(6, 34, ['C-048', 'C-049', 'C-050', 'C-051'])
  dn(6, 36, ['C-052', 'C-053', 'C-054', 'C-055']); dn(6, 37, ['C-056', 'C-057', 'C-058', 'C-059'])

  // ── 우측 룸: 회의실2 ──
  lbl(7, 42, '회의실2')

  // ── 하단: B존 아랫줄 (B-004 ~ B-128), 전체 폭 ──
  dn(10, 6, ['B-004', 'B-005', 'B-006']);          dn(10, 7, ['B-010', 'B-011', 'B-012'])
  dn(10, 9, ['B-016', 'B-017', 'B-018', 'B-019']); dn(10, 10, ['B-023', 'B-024', 'B-025', 'B-026'])
  dn(10, 12, ['B-029', 'B-030', 'B-031', 'B-032']); dn(10, 13, ['B-035', 'B-036', 'B-037', 'B-038'])
  dn(10, 15, ['B-041', 'B-042', 'B-043']);         dn(10, 16, ['B-046', 'B-047', 'B-048'])
  dn(10, 18, ['B-051', 'B-052', 'B-053', 'B-054']); dn(10, 19, ['B-057', 'B-058', 'B-059', 'B-060'])
  dn(10, 21, ['B-061', 'B-062', 'B-063', 'B-064']); dn(10, 22, ['B-065', 'B-066', 'B-067', 'B-068'])
  dn(10, 24, ['B-069', 'B-070', 'B-071']);         dn(10, 25, ['B-072', 'B-073', 'B-074', 'B-075'])
  dn(10, 27, ['B-076', 'B-077', 'B-078', 'B-079']); dn(10, 28, ['B-080', 'B-081', 'B-082', 'B-083'])
  dn(10, 30, ['B-084', 'B-085', 'B-086', 'B-087']); dn(10, 31, ['B-088', 'B-089', 'B-090'])
  dn(10, 33, ['B-091', 'B-092', 'B-093', 'B-094']); dn(10, 34, ['B-095', 'B-096', 'B-097', 'B-098'])
  dn(10, 36, ['B-099', 'B-100', 'B-101', 'B-102']); dn(10, 37, ['B-103', 'B-104', 'B-105', 'B-106'])
  dn(10, 39, ['B-107', 'B-108', 'B-109', 'B-110']); dn(10, 40, ['B-111', 'B-112', 'B-113'])
  dn(10, 42, ['B-114', 'B-115', 'B-116', 'B-117']); dn(10, 43, ['B-118', 'B-119', 'B-120', 'B-121'])
  dn(10, 45, ['B-122', 'B-123', 'B-124', 'B-125']); dn(10, 46, ['B-126', 'B-127', 'B-128'])

  // trim trailing nulls per row to reduce empty width
  return g.map((row) => {
    let last = row.length - 1
    while (last >= 0 && row[last] === null) last--
    return row.slice(0, last + 1)
  })
}

const semicolon12: Zone = {
  id: 'semicolon-12f',
  name: '세미콜론 12층 (Tech&BAU)',
  building: 'semicolon',
  floor: '12F',
  capacity: 187,
  rows: buildSemicolon(),
}

// ─────────────────────────────────────────────
// 10. 웨스트게이트 7층 F존  (61석)
//     F-01 ~ F-61
// ─────────────────────────────────────────────
const westgate7F: Zone = {
  id: 'westgate-7f-f',
  name: '웨스트게이트 7층 F존',
  building: 'westgate',
  floor: '7F',
  capacity: 61,
  rows: [
    ['LABEL:회의실', null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    // Row 1 (14석)
    ['F-01', 'F-02', 'F-03', 'F-04', 'F-05', 'F-06', 'F-07'],
    ['F-08', 'F-09', 'F-10', 'F-11', 'F-12', 'F-13', 'F-14'],
    [null, null, null, null, null, null, null],
    // Row 2 (16석)
    ['F-15', 'F-16', 'F-17', 'F-18', 'F-19', 'F-20', 'F-21', 'F-22'],
    ['F-23', 'F-24', 'F-25', 'F-26', 'F-27', 'F-28', 'F-29', 'F-30'],
    [null, null, null, null, null, null, null, null],
    // Row 3 (16석)
    ['F-31', 'F-32', 'F-33', 'F-34', 'F-35', 'F-36', 'F-37', 'F-38'],
    ['F-39', 'F-40', 'F-41', 'F-42', 'F-43', 'F-44', 'F-45', 'F-46'],
    [null, null, null, null, null, null, null, null],
    // Row 4 (15석)
    ['F-47', 'F-48', 'F-49', 'F-50', 'F-51', 'F-52', 'F-53', 'F-54'],
    ['F-55', 'F-56', 'F-57', 'F-58', 'F-59', 'F-60', 'F-61'],
  ],
}

// ─────────────────────────────────────────────
// 11. 웨스트게이트 7층 G존  (62석)
//     G-01 ~ G-62
// ─────────────────────────────────────────────
const westgate7G: Zone = {
  id: 'westgate-7f-g',
  name: '웨스트게이트 7층 G존',
  building: 'westgate',
  floor: '7F',
  capacity: 62,
  rows: [
    ['LABEL:회의실', 'LABEL:회의실', null, null, null, null, null],
    [null, null, null, null, null, null, null],
    // Left cluster (24석)
    ['G-01', 'G-02', null, 'G-05', 'G-06', null, null],
    ['G-03', 'G-04', null, 'G-07', 'G-08', null, null],
    [null, null, null, null, null, null, null],
    ['G-09', 'G-10', null, 'G-13', 'G-14', null, null],
    ['G-11', 'G-12', null, 'G-15', 'G-16', null, null],
    [null, null, null, null, null, null, null],
    ['G-17', 'G-18', null, 'G-21', 'G-22', null, null],
    ['G-19', 'G-20', null, 'G-23', 'G-24', null, null],
    [null, null, null, null, null, null, null],
    ['G-25', 'G-26', 'G-27', null, null, null, null],
    ['G-28', 'G-29', 'G-30', null, null, null, null],
    [null, null, null, null, null, null, null],
    // Right large cluster (32석)
    ['G-31', 'G-35', null, 'G-39', 'G-43', null, 'G-51', 'G-55'],
    ['G-32', 'G-36', null, 'G-40', 'G-44', null, 'G-52', 'G-56'],
    ['G-33', 'G-37', null, 'G-41', 'G-45', null, 'G-53', 'G-57'],
    ['G-34', 'G-38', null, 'G-42', 'G-46', null, 'G-54', 'G-58'],
    [null, null, null, null, null, null, null, null],
    ['G-47', 'G-49', null, null, null, null, 'G-59', 'G-61'],
    ['G-48', 'G-50', null, null, null, null, 'G-60', 'G-62'],
  ],
}

// ─────────────────────────────────────────────
// 12. 웨스트게이트 7층 N존  (32석)
//     N-01 ~ N-32
// ─────────────────────────────────────────────
const westgate7N: Zone = {
  id: 'westgate-7f-n',
  name: '웨스트게이트 7층 N존',
  building: 'westgate',
  floor: '7F',
  capacity: 32,
  rows: [
    // Left cluster
    ['N-01', 'N-02', 'N-03', null, null, null, null, null, null, null, null, null, 'N-04', 'N-05', 'N-06', 'N-07', 'N-08'],
    ['N-09', 'N-10', 'N-11', null, null, null, null, null, null, null, null, null, 'N-12', 'N-13', 'N-14', 'N-15', 'N-16'],
    [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
    ['N-17', 'N-18', 'N-19', null, null, null, null, null, null, null, null, null, 'N-20', 'N-21', 'N-22', 'N-23', 'N-24'],
    ['N-25', 'N-26', 'N-27', null, null, null, null, null, null, null, null, null, 'N-28', 'N-29', 'N-30', 'N-31', 'N-32'],
  ],
}

// ─────────────────────────────────────────────
// Export all zones indexed by id
// ─────────────────────────────────────────────
export const ZONES: Record<string, Zone> = {
  [bonsa6A.id]:      bonsa6A,
  [baejae6E.id]:     baejae6E,
  [baejae9C.id]:     baejae9C,
  [baejae9D.id]:     baejae9D,
  [baejae9N.id]:     baejae9N,
  [baejae10A1.id]:   baejae10A1,
  [baejae10A2.id]:   baejae10A2,
  [baejae10B.id]:    baejae10B,
  [semicolon12.id]:  semicolon12,
  [westgate7F.id]:   westgate7F,
  [westgate7G.id]:   westgate7G,
  [westgate7N.id]:   westgate7N,
}

export const BUILDINGS: Building[] = [
  {
    id: 'bonsa',
    name: '본사',
    zones: ['bonsa-6f-a'],
  },
  {
    id: 'baejae-mgmt',
    name: '배재관리동',
    zones: ['baejae-mgmt-6f-e'],
  },
  {
    id: 'baejae-9f',
    name: '배재빌딩 9층',
    zones: ['baejae-9f-c', 'baejae-9f-d', 'baejae-9f-n'],
  },
  {
    id: 'baejae-10f',
    name: '배재빌딩 10층',
    zones: ['baejae-10f-a1', 'baejae-10f-a2', 'baejae-10f-b'],
  },
  {
    id: 'semicolon',
    name: '세미콜론 12층',
    zones: ['semicolon-12f'],
  },
  {
    id: 'westgate',
    name: '웨스트게이트 7층',
    zones: ['westgate-7f-f', 'westgate-7f-g', 'westgate-7f-n'],
  },
]

// Extract all seat codes from a zone's layout rows
export function getSeatsInZone(zone: Zone): string[] {
  const seats: string[] = []
  for (const row of zone.rows) {
    for (const cell of row) {
      if (cell && !cell.startsWith('LABEL:') && cell !== 'null') {
        seats.push(cell)
      }
    }
  }
  return seats
}

// Build globally unique seat uid
export function seatUid(zoneId: string, code: string): string {
  return `${zoneId}::${code}`
}

// Parse seat uid back to parts
export function parseSeatUid(uid: string): { zoneId: string; code: string } {
  const [zoneId, code] = uid.split('::')
  return { zoneId, code }
}

export const ALL_ZONES = Object.values(ZONES)

export const TOTAL_SEATS = ALL_ZONES.reduce((sum, z) => sum + z.capacity, 0)

// unused but kept for possible future use
export { grid }
