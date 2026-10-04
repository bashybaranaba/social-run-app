import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RunSide — Better runs, better company",
  description: "Find a running partner nearby. Plan a run, match with someone at your pace, and meet on the move."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
