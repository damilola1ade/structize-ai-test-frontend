import { ErrorTextProp } from "@/types";

export const ErrorText = ({ message }: ErrorTextProp) => {
  return <p className="max-w-[150px] text-red-500 text-xs mt-1">{message}</p>;
};