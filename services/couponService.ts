import { Coupon } from '../types';

const COUPONS_KEY = 'odl-cinema-coupons';

// Seed some default coupons if none exist
const defaultCoupons: Coupon[] = [
  {
    code: 'WELCOME50',
    description: 'Flat ₹50 off on your first booking',
    discountType: 'flat',
    amount: 50,
    usageLimit: 1000,
    used: 0,
    expiresAt: null,
  },
  {
    code: 'SAVE10',
    description: 'Save 10% on total ticket price',
    discountType: 'percent',
    amount: 10,
    usageLimit: 500,
    used: 0,
    expiresAt: null,
  },
];

const initCoupons = () => {
  const existing = localStorage.getItem(COUPONS_KEY);
  if (!existing) {
    localStorage.setItem(COUPONS_KEY, JSON.stringify(defaultCoupons));
  }
};

initCoupons();

export const getAllCoupons = (): Coupon[] => {
  const json = localStorage.getItem(COUPONS_KEY);
  return json ? JSON.parse(json) : [];
};

export const addOrUpdateCoupon = (coupon: Coupon) => {
  const coupons = getAllCoupons();
  const idx = coupons.findIndex(c => c.code === coupon.code);
  if (idx !== -1) {
    coupons[idx] = coupon;
  } else {
    coupons.push(coupon);
  }
  localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
};

export const validateCoupon = (code: string): Coupon | null => {
  const coupons = getAllCoupons();
  const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
  if (!coupon) return null;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
  if (coupon.used >= coupon.usageLimit) return null;
  return coupon;
};

export const markCouponUsed = (code: string) => {
  const coupons = getAllCoupons();
  const idx = coupons.findIndex(c => c.code === code);
  if (idx !== -1) {
    coupons[idx].used += 1;
    localStorage.setItem(COUPONS_KEY, JSON.stringify(coupons));
  }
};