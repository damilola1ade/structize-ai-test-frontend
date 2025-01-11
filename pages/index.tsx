import { DM_Sans } from "next/font/google";
import { App } from "@/components/app";

const dmSans = DM_Sans({ subsets: ["latin"] });

export default function Home() {
  return (
    <div className={`${dmSans} font-[family-name:var(--font-geist-sans)]`}>
      <App />
    </div>
  );
}
