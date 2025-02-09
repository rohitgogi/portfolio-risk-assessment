import { MultiStepLoader } from "@/app/components/loader";

const loadingStates = [
  { text: "Fetching stock prices", duration: 2000 },
  { text: "Calculating risk", duration: 1500 },
  { text: "Optimizing portfolio", duration: 2500 },
  { text: "Finalizing portfolio", duration: 1000 },
];

export default function LoadingPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-4xl font-bold text-white">Loading...</h1>
      <MultiStepLoader loadingStates={loadingStates} loading={true} />
    </div>
  );
}