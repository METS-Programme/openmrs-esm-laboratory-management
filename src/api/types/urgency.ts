export const UrgencyStat = "STAT";
export const UrgencyRoutine = "ROUTINE";
export const UrgencyTypes = [UrgencyRoutine, UrgencyStat] as const;
export type UrgencyType = (typeof UrgencyTypes)[number];
