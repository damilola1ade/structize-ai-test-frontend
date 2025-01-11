import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import io from "socket.io-client";

type Response = {
  jobType: string;
  result: number;
  progress: number;
};

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const socket = io(backendUrl);

export default function App() {
  const [a, setA] = useState<number | "">(0);
  const [b, setB] = useState<number | "">(0);
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<Response[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedJobs, setCompletedJobs] = useState<number>(0);

  const jobs: string[] = ["A + B", "A - B", "A * B", "A / B"];

  const handleCompute = async () => {
    setLoading(true);
    setProgress(0);
    setResults([]);
    setCompletedJobs(0);

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
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    socket.on("result", (data: Response) => {
      setResults((prevResults) => [...prevResults, data]);
      setProgress((prevProgress) => prevProgress + data.progress);
      setCompletedJobs((prev) => prev + 1);
    });

    return () => {
      socket.off("result");
    };
  }, []);

  console.log(results);

  return (
    <main className="container min-h-screen px-4 flex flex-col justify-center items-center tracking-tight text-sm">
      <h1 className="text-center text-lg font-bold">Basic Queue App</h1>
      <div className="mt-5 flex flex-col gap-12 justify-center items-center">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
          <Input
            placeholder="Enter number A"
            value={a === 0 ? "" : a}
            type="number"
            onChange={(e) => setA(Number(e.target.value))}
          />
          <Input
            placeholder="Enter number B"
            value={b === 0 ? "" : b}
            type="number"
            onChange={(e) => setB(Number(e.target.value))}
          />
          <Button
            onClick={handleCompute}
            disabled={progress != 100 && loading}
            className="col-span-2 w-full md:col-span-1"
          >
            Compute
          </Button>
        </div>

        {loading ? (
          <div className="flex flex-col gap-3">
            <p className="text-center font-bold">
              {progress != 100 && "Computing..."}
              {completedJobs} out of 4 jobs finished
            </p>
            <Progress value={progress} className="w-[320px] md:w-[480px]" />
            <div className="flex justify-center">
              <ul>
                {jobs.map((jobType, index) => {
                  const result = results.find((res) => res.jobType === jobType);
                  return (
                    <li key={index}>
                      {jobType} = {result ? result.result : "Computing..."}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
