// One problem per fix, counted the desk's way. causes.ts sorts a report by tenant and channel and
// counts it where it is filed; a report the desk read as a one-day move (desk-notes.json) is a
// different bug, so it gets its own row, footnoted under the cause it is filed in.
import { groupByCause, readAs, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = Cause | 'shift';

export const WHAT: Record<Problem, string> = {
  parser: 'Shared parser reads day-first dates month first: day and month swap.',
  hint: 'booking-v3 form hints MM/DD/YYYY to day-first tenants, then reads the input day first.',
  shift: 'Date moves one day earlier, not a swap. Varies by recipient time zone.',
};

export type ProblemRow = {
  problem: Problem | 'unplaced';
  reports: number;
  tenants: number;
  firstSeen: string;
  lastSeen: string;
  // For `shift`: the cause the desk files these reports under, and counts them in.
  filedUnder?: Cause | 'unplaced';
};

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { total: number; rows: ProblemRow[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const groups = groupByCause(merged, tenantOf);
  const rows: ProblemRow[] = groups.map((g) => ({
    problem: g.cause,
    reports: g.reports.length,
    tenants: g.tenants,
    firstSeen: g.firstSeen,
    lastSeen: g.lastSeen,
  }));
  const moved = merged.filter((r) => oneDayMove.includes(r.id));
  if (moved.length) {
    const days = moved.map((r) => r.receivedAt.slice(0, 10)).sort();
    const home = groups.filter((g) => readAs(g, oneDayMove) > 0);
    rows.push({
      problem: 'shift',
      reports: moved.length,
      tenants: new Set(moved.map((r) => r.tenant)).size,
      firstSeen: days[0],
      lastSeen: days[days.length - 1],
      filedUnder: home.length === 1 ? home[0].cause : undefined,
    });
  }
  return { total: merged.length, rows };
}
