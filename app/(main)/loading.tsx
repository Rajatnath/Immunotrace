import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-200px)] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-[#2EC4B6]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-sm font-medium">Loading...</p>
      </div>
    </div>
  );
}
