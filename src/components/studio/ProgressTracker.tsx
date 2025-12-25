'use client';

import { CheckCircle, Circle, ArrowRight } from 'lucide-react';

export interface ProgressStep {
  id: string;
  order: number;
  title: string;
  description: string;
  tabId: string;
  completed: boolean;
  current: boolean;
}

interface ProgressTrackerProps {
  steps: ProgressStep[];
  onStepClick: (tabId: string) => void;
}

export function ProgressTracker({ steps, onStepClick }: ProgressTrackerProps) {
  return (
    <aside className="progress-sidebar">
      <div className="progress-header">
        <h3 className="text-lg font-semibold">Project Progress</h3>
        <div className="progress-bar">
          <div 
            className="progress-fill" 
            style={{ width: `${calculateProgress(steps)}%` }}
          />
        </div>
        <span className="progress-text">{calculateProgress(steps)}%</span>
      </div>
      
      <div className="progress-steps">
        {steps.map((step) => (
          <div 
            key={step.id}
            className={`progress-step ${step.completed ? 'completed' : ''} ${step.current ? 'current' : ''}`}
            onClick={() => onStepClick(step.tabId)}
          >
            <div className="step-icon">
              {step.completed ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : step.current ? (
                <div className="step-number">{step.order}</div>
              ) : (
                <Circle className="h-5 w-5 text-gray-300" />
              )}
            </div>
            <div className="step-content">
              <h4 className="font-medium">{step.title}</h4>
              <p className="step-description text-sm text-gray-500">{step.description}</p>
            </div>
            {step.current && (
              <ArrowRight className="h-5 w-5 text-blue-500 animate-pulse" />
            )}
          </div>
        ))}
      </div>
    </aside>
  );
}

function calculateProgress(steps: ProgressStep[]): number {
  const completed = steps.filter(s => s.completed).length;
  return Math.round((completed / steps.length) * 100);
}
