"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { MultiStepLoader } from "@/app/components/multi-step-loader";

const loadingStates = [
  { text: "Creating custom game scenario" },
  { text: "Fetching current stock prices" },
  { text: "Finding optimal answer" },
  { text: "Preparing your challenge" }
];

export default function LoadingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const difficulty = searchParams.get('difficulty') || 'medium';
    const timeSpan = searchParams.get('time') || '6';

    const fetchData = async () => {
      try {
        // Fetch client data
        setCurrentStep(0);
        const clientResponse = await fetch(`http://127.0.0.1:8000/generate_client/${difficulty}/${timeSpan}`);
        const clientData = await clientResponse.json();

        // Fetch stock prices
        setCurrentStep(1);
        const stockResponse = await fetch('http://127.0.0.1:8000/stock_prices');
        const stockData = await stockResponse.json();

        // Simulate finding optimal answer
        setCurrentStep(2);
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Prepare challenge
        setCurrentStep(3);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Redirect to client page with data
        router.push(`/client?clientData=${encodeURIComponent(JSON.stringify(clientData))}&stockData=${encodeURIComponent(JSON.stringify(stockData))}`);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle error (e.g., redirect to an error page)
        router.push('/error');
      }
    };  

    fetchData();
  }, [router, searchParams]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#1d0428]">
      <MultiStepLoader
        loadingStates={loadingStates}
        loading={true}
        duration={2000}
        loop={false}
        currentStep={currentStep}
      />
    </div>
  );
}
