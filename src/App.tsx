import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { InputSection } from './components/InputSection';
import { ResultsPage } from './components/ResultsPage';
import StudentSearch from './components/StudentSearch';
import StudentTimetable from './components/StudentTimetable';
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
      
      // Parse and validate input data
      const students = parseStudentData(studentData);
      const courses = parseCourseList(courseList);
      
      if (students.length === 0) {
        throw new Error('No valid student data found. Please check the format: "StudentID: Course1, Course2"');
      }
      if (courses.length === 0) {
        throw new Error('No valid courses found. Please provide a comma-separated list of courses.');
      }
      
      // Validate that students' courses exist in the course list
      const courseSet = new Set(courses);
      const missingCourses = new Set<string>();
      students.forEach(student => {
        student.courses.forEach(course => {
          if (!courseSet.has(course)) {
            missingCourses.add(course);
          }
        });
      });
      
      if (missingCourses.size > 0) {
        toast.error(`Warning: Some courses in student data are not in the course list: ${Array.from(missingCourses).join(', ')}`);
      }
      
      // Build conflict graph and generate schedule
      const conflictGraph = buildConflictGraph(students, courses);
      const scheduleResult = greedyColoring(conflictGraph, students);
      
      // Calculate efficiency
      const efficiency = scheduleResult.totalSlots > 0 ? 
        Math.round((scheduleResult.courses.size / scheduleResult.totalSlots) * 100) : 0;
      
      setResult(scheduleResult);
      
      // Enhanced success message with statistics
      toast.success(
        `Schedule generated successfully! 
        ${scheduleResult.totalSlots} time slots needed for ${scheduleResult.courses.size} courses. 
        Efficiency: ${efficiency}%. 
        Conflicts resolved: ${scheduleResult.totalConflicts}.`
      );
      
      navigate('/results');
    } catch (error) {
      console.error('Scheduling error:', error);
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
        <div className="w-full px-4 py-3">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent flex items-center justify-center gap-3"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="p-3 bg-white/30 rounded-full backdrop-blur-sm border-2 border-white/40"
              >
                <GraduationCap className="w-10 h-10 text-white" />
              </motion.div>
              Graph Coloring-Based Scheduling
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg md:text-xl text-blue-100 mb-2 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Conflict-Free Exam Allocation System
              <Sparkles className="w-5 h-5" />
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
          <Route
            path="/search"
            element={result ? <StudentSearch result={result} /> : <div className="text-center text-lg">No results to search. Please generate a schedule first.</div>}
          />
          <Route
            path="/student/:studentId"
            element={<StudentTimetable />}
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
          <p className="text-xs text-slate-500">
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
