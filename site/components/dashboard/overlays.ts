// @ts-nocheck
export const getPromosInRange = (promos, s, e) => promos.filter((p) => p.startDate <= e && p.endDate >= s);
export const getAnnotationsInRange = (anns, s, e) => anns.filter((a) => a.date >= s && a.date <= e);
