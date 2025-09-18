import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { InputSection } from './components/InputSection';
import { ResultsPage } from './components/ResultsPage';
import { 
  parseStudentData, 
  parseCourseList, 
  buildConflictGraph, 
  greedyColoring 
} from './utils/graphColoring';
import { ScheduleResult } from './types';
import { GraduationCap, Sparkles } from 'lucide-react';

function AppContent() {
  const [studentData, setStudentData] = useState('');
  const [courseList, setCourseList] = useState('');
  const [result, setResult] = useState<ScheduleResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!studentData.trim() || !courseList.trim()) {
      toast.error('Please provide both student data and course list');
      return;
    }

    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const students = parseStudentData(studentData);
      const courses = parseCourseList(courseList);
      if (students.length === 0) {
        throw new Error('No valid student data found');
      }
      if (courses.length === 0) {
        throw new Error('No valid courses found');
      }
      const conflictGraph = buildConflictGraph(students, courses);
      const scheduleResult = greedyColoring(conflictGraph);
      setResult(scheduleResult);
      toast.success(`Schedule generated successfully! ${scheduleResult.totalSlots} time slots needed.`);
      navigate('/results');
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error occurred'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white shadow-2xl w-full"
      >
        <div className="w-full px-4 py-4">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex justify-center mb-4"
            >
              <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                <GraduationCap className="w-12 h-12" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent"
            >
              Graph Coloring-Based Scheduling
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-xl md:text-2xl text-blue-100 mb-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-6 h-6" />
              Conflict-Free Exam Allocation System
              <Sparkles className="w-6 h-6" />
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-blue-200 max-w-2xl mx-auto"
            >
              Automatically generate optimal exam schedules using advanced graph coloring algorithms
            </motion.p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 py-8 space-y-8">
        <Routes>
          <Route
            path="/"
            element={
              <InputSection
                studentData={studentData}
                courseList={courseList}
                onStudentDataChange={setStudentData}
                onCourseListChange={setCourseList}
                onGenerate={handleGenerate}
                isLoading={isLoading}
              />
            }
          />
          <Route
            path="/results"
            element={result ? <ResultsPage result={result} /> : <div className="text-center text-lg">No results to display. Please generate a schedule first.</div>}
          />
        </Routes>
      </main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="bg-slate-900 text-slate-300 py-8 mt-16 w-full"
      >
        <div className="w-full px-4 text-center">
          <p className="text-sm">
            Built with React, TypeScript, D3.js, and Framer Motion
          </p>
          <p className="text-xs mt-2 text-slate-500">
            Graph Coloring Algorithm • Conflict-Free Scheduling • Interactive Visualization
          </p>
        </div>
      </motion.footer>

      <Toaster position="top-right" />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
