import { Geist } from "next/font/google";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)]`}
    >
      <Link href="/app">App</Link>
    </div>
  );
}
