/**
 * Print-only layout — bypasses the dashboard sidebar/header/bottom-tab/install
 * prompt entirely. Inherits only the root layout (html/body/fonts/theme init).
 *
 * Pages under /print/* are designed for A4 print output. They render their own
 * minimal "preview header" with a print button and look like a document
 * preview rather than an app screen.
 */

export default function PrintLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
