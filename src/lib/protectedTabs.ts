// Tab ids that require a signed-in user. Shared between App.tsx's route
// guard and Navbar.tsx's nav-item filtering so the list of protected tabs
// only lives in one place. Kept as a plain string Set (not typed against
// AppTab) to avoid a circular import between App.tsx and this module.
export const PROTECTED_TABS = new Set<string>(['creator', 'settings', 'payments', 'onboarding']);
