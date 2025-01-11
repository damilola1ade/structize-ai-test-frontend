import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import io from "socket.io-client";
import { ErrorText } from "@/components/ui/error-text";
import { FormData, Response } from "@/types";

const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

const socket = io(backendUrl);

export default function App() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const [progress, setProgress] = useState<number>(0);
  const [results, setResults] = useState<Response[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [completedJobs, setCompletedJobs] = useState<number>(0);

  const jobs: string[] = ["A + B", "A - B", "A * B", "A / B"];

  const handleCompute: SubmitHandler<FormData> = async (formData) => {
    const a = Number(formData.a);
    const b = Number(formData.b);

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
        body: JSON.stringify({ a, b }),
      });

      console.log("Compute request sent");

      socket.emit("compute", { a, b });
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
        <form
          onSubmit={handleSubmit(handleCompute)}
          className="grid grid-cols-2 md:grid-cols-3 gap-5"
        >
          <div>
            <Input
              placeholder="Enter number A"
              {...register("a", {
                required: "Provide the first number",
                pattern: {
                  value: /^-?\d+$/,
                  message: "Number A must be a valid number (e.g., -12, 34)",
                },
              })}
            />
            {errors.a && <ErrorText message={errors.a.message} />}
          </div>
          <div>
            <Input
              placeholder="Enter number B"
              {...register("b", {
                required: "Provide the second number",
                pattern: {
                  value: /^-?\d+$/,
                  message: "Number A must be a valid number (e.g., -12, 34)",
                },
              })}
            />
            {errors.b && <ErrorText message={errors.b.message} />}
          </div>
          <Button
            type="submit"
            disabled={progress !== 100 && loading}
            className="col-span-2 w-full md:col-span-1"
          >
            Compute
          </Button>
        </form>

        {loading && (
          <div className="flex flex-col gap-3">
            <p className="text-center font-bold">
              {progress !== 100 && "Computing..."}
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
        )}
      </div>
    </main>
  );
}
