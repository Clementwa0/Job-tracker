import { Navigate, Route } from "react-router-dom";
import { LEGACY_TRACKER_REDIRECTS } from "@/constants/routes";

/**
 * Route elements for bookmarks from the pre–job-board personal tracker.
 * Spread inside the root <Routes> in App.tsx.
 */
export const legacyRedirectRoutes = LEGACY_TRACKER_REDIRECTS.map(({ from, to }) => (
  <Route key={from} path={from} element={<Navigate to={to} replace />} />
));
