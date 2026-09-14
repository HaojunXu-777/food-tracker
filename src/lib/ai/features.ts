/**
 * Current release runs in free mode: paid AI features are disabled in the UI
 * and frontend must not call /api/analyze-food or /api/estimate-weight.
 * Keep routes and client code; flip this to true to re-enable later.
 */
export const AI_FEATURES_ENABLED = false;
