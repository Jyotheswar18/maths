import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatisticsPanel } from './StatisticsPanel';
import { TimetableView } from './TimetableView';
import { GraphVisualization } from './GraphVisualization';
import { ScheduleResult } from '../types';

interface ResultsPageProps {
  result: ScheduleResult;
}

export function ResultsPage({ result }: ResultsPageProps) {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col gap-8">
      <button
        className="self-start mb-4 px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition"
        onClick={() => navigate('/')}
      >
        ← Back
      </button>
      <StatisticsPanel result={result} />
      <TimetableView result={result} />
      <GraphVisualization result={result} />
    </div>
  );
}
