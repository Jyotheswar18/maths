import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatisticsPanel } from './StatisticsPanel';
import { TimetableView } from './TimetableView';
import { GraphVisualization } from './GraphVisualization';
import { StudentEnrollmentsDisplay } from './StudentEnrollmentsDisplay';
import { ScheduleResult } from '../types';

interface ResultsPageProps {
  result: ScheduleResult;
}

export function ResultsPage({ result }: ResultsPageProps) {
  const navigate = useNavigate();
  return (
    <div className="w-full flex flex-col gap-8">
      <div className="flex justify-between items-center mb-4">
        <button
          className="px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition"
          onClick={() => navigate('/')}
        >
          ← Back
        </button>
        <button
          className="px-4 py-2 rounded bg-gradient-to-r from-green-600 to-teal-600 text-white font-semibold hover:from-green-700 hover:to-teal-700 transition"
          onClick={() => navigate('/search')}
        >
          🔍 Student Search
        </button>
      </div>
      <StatisticsPanel result={result} />
      {result.students && result.students.length > 0 && (
        <StudentEnrollmentsDisplay students={result.students} />
      )}
      <TimetableView result={result} />
      <GraphVisualization result={result} />
    </div>
  );
}
