import { db } from "@/lib/db";

export const MAX_BOOKINGS_PER_SLOT = 2;

export const DEFAULT_HOURS = {
  0: { enabled: false, start: "09:00", end: "18:00" },
  1: { enabled: true, start: "09:00", end: "18:00" },
  2: { enabled: true, start: "09:00", end: "18:00" },
  3: { enabled: true, start: "09:00", end: "18:00" },
  4: { enabled: true, start: "09:00", end: "18:00" },
  5: { enabled: true, start: "09:00", end: "18:00" },
  6: { enabled: true, start: "09:00", end: "18:00" },
};

function normalizeHours(hours) {
  return Object.fromEntries(
    Object.entries(DEFAULT_HOURS).map(([day, fallback]) => [
      day,
      {
        enabled: hours?.[day]?.enabled !== undefined ? Boolean(hours[day].enabled) : fallback.enabled,
        start: /^([01]\d|2[0-3]):[0-5]\d$/.test(hours?.[day]?.start || "") ? hours[day].start : fallback.start,
        end: /^([01]\d|2[0-3]):[0-5]\d$/.test(hours?.[day]?.end || "") ? hours[day].end : fallback.end,
      },
    ])
  );
}

export async function getBusinessHours() {
  const setting = await db.businessHours.findUnique({ where: { id: "default" } });
  return normalizeHours(setting?.hours || DEFAULT_HOURS);
}

export function dayOfWeek(dateStr) {
  return new Date(`${dateStr}T12:00:00`).getDay();
}

export function generateDaySlots(hours) {
  if (!hours?.enabled) return [];
  const [startH, startM] = hours.start.split(":").map(Number);
  const [endH, endM] = hours.end.split(":").map(Number);
  let start = startH * 60 + startM;
  const end = endH * 60 + endM;
  const slots = [];
  while (start < end) {
    const h = Math.floor(start / 60);
    const m = start % 60;
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    start += 60;
  }
  return slots;
}

export async function getSlotsForDate(dateStr) {
  const hours = await getBusinessHours();
  return generateDaySlots(hours[dayOfWeek(dateStr)]);
}

export function isSunday(dateStr) {
  return dayOfWeek(dateStr) === 0;
}

export { normalizeHours };
