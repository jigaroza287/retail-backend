import {
  ORDER_STATUS_TRANSITIONS,
  OrderStatus,
} from "../constants/orderStatus";

export function canTransition(
  current: OrderStatus,
  next: OrderStatus,
): boolean {
  const allowed = ORDER_STATUS_TRANSITIONS[current] ?? [];
  return allowed.includes(next);
}
