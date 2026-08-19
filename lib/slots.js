// Openingsuren: 09:00 - 18:00, elk uur een slot. Pas dit gerust aan.
const OPEN_HOUR = 9;
const CLOSE_HOUR = 18;
const MAX_BOOKINGS_PER_SLOT = 2; // hoeveel afspraken tegelijk per tijdslot toegestaan zijn

export function generateDaySlots() {
  const slots = [];
  for (let h = OPEN_HOUR; h < CLOSE_HOUR; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
  }
  return slots;
}

export function isSunday(dateStr) {
  const d = new Date(dateStr + "T00:00:00");
  return d.getDay() === 0;
}

export { MAX_BOOKINGS_PER_SLOT };
