function getLocalTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export function formatStatusBarTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: getLocalTimeZone(),
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatFullDate(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: getLocalTimeZone(),
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatClockTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    timeZone: getLocalTimeZone(),
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);
}

export function getLocalTimeZoneLabel(date: Date) {
  const part = new Intl.DateTimeFormat(undefined, {
    timeZone: getLocalTimeZone(),
    timeZoneName: "short",
  })
    .formatToParts(date)
    .find((p) => p.type === "timeZoneName");
  return part?.value ?? getLocalTimeZone();
}

export { getLocalTimeZone };

/** Night is after sundown (6 PM) until sunrise (6 AM), local time. */
export function isPastSundown(hour: number) {
  return hour >= 18 || hour < 6;
}
