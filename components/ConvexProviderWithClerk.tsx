// This file is kept for compatibility but is no longer used.
// Convex and Clerk have been replaced with local SQLite + no-auth mode.
export default function ConvexClerkProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
