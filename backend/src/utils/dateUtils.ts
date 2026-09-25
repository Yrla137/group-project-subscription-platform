// All helpers work with ISO date strings (YYYY-MM-DD) interpreted as UTC.
// This avoids the local-time vs UTC mismatch you get when mixing setDate() and toISOString().

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toUtcDate(iso: string): Date {
    return new Date(`${iso}T00:00:00Z`);
}

export function isIsoDate(value: unknown): value is string {
    if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) return false;
    const date = toUtcDate(value);
    // Rejects impossible dates like 2026-02-31
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function todayIso(): string {
    return new Date().toISOString().slice(0, 10);
}

export function addDaysIso(iso: string, days: number): string {
    const date = toUtcDate(iso);
    date.setUTCDate(date.getUTCDate() + days);
    return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string): number {
    return Math.round((toUtcDate(to).getTime() - toUtcDate(from).getTime()) / MS_PER_DAY);
}

// YYYY-MM-DD strings sort lexicographically in date order, so plain comparison works
export function maxIso(a: string, b: string): string {
    return a > b ? a : b;
}

export function minIso(a: string, b: string): string {
    return a < b ? a : b;
}

export function isWithin(iso: string, from: string, to: string): boolean {
    return iso >= from && iso <= to;
}

export function eachDayIso(from: string, to: string): string[] {
    const days: string[] = [];
    for (let current = from; current <= to; current = addDaysIso(current, 1)) {
        days.push(current);
    }
    return days;
}