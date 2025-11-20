import { useState } from "react";

interface LoadingProgressProps {
  progress: number;
  label?: string;
}

export const LoadingProgress = ({ progress, label = "Loading 3D Model..." }: LoadingProgressProps) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10">
      <div className="w-64 space-y-3">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};