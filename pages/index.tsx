import { Geist } from "next/font/google";
import App from "./app";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} font-[family-name:var(--font-geist-sans)]`}
    >
      <App />
    </div>
  );
}
