/**
 * CITIZEN MODULE
 *
 * Target users: Individual citizens using government logistics services.
 * Accessible to all authenticated users.
 *
 * Pages owned by this module:
 *   /dashboard/vehicle   — Vehicle & Driver Intel (RC/DL lookup)
 *   /dashboard/fastag    — FASTag Balance & Transaction History
 */

export { default as VehicleIntel } from './pages/VehicleIntel';
export { default as FASTag } from './pages/FASTag';
