"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type TourStep = {
  target: string;
  content: string;
  position: "top" | "right" | "bottom" | "left";
};

const tourSteps: TourStep[] = [
  {
    target: "#universe-id-input",
    content: "Start by entering your Roblox Universe ID here",
    position: "bottom"
  },
  {
    target: "#api-token-input",
    content: "Then enter your API Token to authenticate",
    position: "bottom"
  },
  {
    target: "#connect-button",
    content: "Click Connect to fetch your datastores",
    position: "bottom"
  },
  {
    target: "#datastore-list",
    content: "Your datastores will appear here. Click one to explore its entries",
    position: "right"
  },
  {
    target: "#entry-list",
    content: "Entries for the selected datastore will appear here",
    position: "right"
  },
  {
    target: "#entry-editor",
    content: "Edit your entry data here with our powerful editor",
    position: "left"
  }
];

export function OnboardingTour() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isTourActive, setIsTourActive] = useState(false);
  
  useEffect(() => {
    // Check if this is the first visit
    const hasTakenTour = localStorage.getItem("onboardingTourComplete");
    if (!hasTakenTour) {
      // Wait a bit before starting the tour
      const timer = setTimeout(() => {
        setIsTourActive(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const nextStep = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTour();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const completeTour = () => {
    setIsTourActive(false);
    localStorage.setItem("onboardingTourComplete", "true");
  };
  
  if (!isTourActive) return null;
  
  const step = tourSteps[currentStep];
  const targetElement = document.querySelector(step.target);
  
  if (!targetElement) return null;
  
  const rect = targetElement.getBoundingClientRect();
  
  // Calculate position for the tooltip
  const tooltipStyle: React.CSSProperties = {
    position: "absolute",
    zIndex: 50,
  };
  
  switch (step.position) {
    case "top":
      tooltipStyle.bottom = `${window.innerHeight - rect.top + 10}px`;
      tooltipStyle.left = `${rect.left + rect.width / 2}px`;
      tooltipStyle.transform = "translateX(-50%)";
      break;
    case "right":
      tooltipStyle.left = `${rect.right + 10}px`;
      tooltipStyle.top = `${rect.top + rect.height / 2}px`;
      tooltipStyle.transform = "translateY(-50%)";
      break;
    case "bottom":
      tooltipStyle.top = `${rect.bottom + 10}px`;
      tooltipStyle.left = `${rect.left + rect.width / 2}px`;
      tooltipStyle.transform = "translateX(-50%)";
      break;
    case "left":
      tooltipStyle.right = `${window.innerWidth - rect.left + 10}px`;
      tooltipStyle.top = `${rect.top + rect.height / 2}px`;
      tooltipStyle.transform = "translateY(-50%)";
      break;
  }
  
  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-40"
        onClick={completeTour}
      />
      
      {/* Highlight target element */}
      <div 
        className="absolute z-40 border-2 border-primary rounded-md animate-pulse-slow"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        }}
      />
      
      {/* Tooltip */}
      <div 
        className="bg-card border shadow-lg rounded-lg p-4 max-w-xs z-50"
        style={tooltipStyle}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="absolute top-1 right-1 h-6 w-6 p-0 rounded-full"
          onClick={completeTour}
        >
          <X className="h-4 w-4" />
        </Button>
        
        <p className="mb-4">{step.content}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            Step {currentStep + 1} of {tourSteps.length}
          </div>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" size="sm" onClick={prevStep}>
                Previous
              </Button>
            )}
            {currentStep < tourSteps.length - 1 ? (
              <Button size="sm" onClick={nextStep}>
                Next
              </Button>
            ) : (
              <Button size="sm" onClick={completeTour}>
                Finish
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 