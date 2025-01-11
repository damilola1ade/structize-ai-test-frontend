import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import io from "socket.io-client";

type Response = {
  jobType: string;
  result: number;
  progress: number;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const socket = io(backendUrl);

export default function App() {
  const [a, setA] = useState<number | undefined>();
  const [b, setB] = useState<number | undefined>();
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<Response[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedJobs, setCompletedJobs] = useState<number>(0);

  const jobs: string[] = ["A+B", "A-B", "A*B", "A/B"];

  const handleCompute = async () => {
    setLoading(true);
    setProgress(0);
    setResults([]);

    try {
      await fetch(`${backendUrl}/compute`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ a: Number(a), b: Number(b) }),
      });

      console.log("Compute request sent");

      socket.emit("compute", { a: Number(a), b: Number(b) });

      socket.on("result", (data: Response) => {
        setResults((prevResults) => [...prevResults, data]);
        setProgress((prevProgress) => prevProgress + data.progress);
        setCompletedJobs((prev) => prev + 1);
      });
    } catch (error) {
      console.error(error);
    }
  };

  console.log(results);

  return (
    <main className="container min-h-screen px-4 flex justify-center items-center">
      <div className="flex flex-col gap-12 justify-center items-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Input
            placeholder="Enter number A"
            type="number"
            value={a}
            onChange={(e) => setA(Number(e.target.value))}
          />
          <Input
            placeholder="Enter number B"
            type="number"
            value={b}
            onChange={(e) => setB(Number(e.target.value))}
          />
          <Button onClick={handleCompute} disabled={loading}>
            Compute
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <p className="text-center">
              Computing...{completedJobs} out of 4 jobs finished
            </p>
            <Progress value={progress} className="lg:w-[480px]" />
            <ul className="">
              {jobs.map((jobType, index) => {
                const result = results.find((res) => res.jobType === jobType);
                return (
                  <li key={index}>
                    {jobType} = {result ? result.result : "Computing"}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </main>
  );
}
