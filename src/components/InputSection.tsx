// Improved CSV parsing utilities
function parseStudentCSV(file: File, callback: (text: string) => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    // Remove header if present, remove quotes, format as S1: Math, Physics
    const lines = text.split(/\r?\n/).filter(Boolean);
    const dataLines = lines[0].toLowerCase().includes('student') ? lines.slice(1) : lines;
    const formatted = dataLines.map(line => {
      // S1,"Math, Physics, Chemistry" or S1,Math, Physics, Chemistry
      const [student, ...courses] = line.split(',');
      let courseStr = courses.join(',').replace(/"/g, '').trim();
      return `${student.trim()}: ${courseStr}`;
    }).join('\n');
    callback(formatted);
  };
  reader.readAsText(file);
}

function parseCoursesCSV(file: File, callback: (text: string) => void) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target?.result as string;
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    if (lines.length === 0) return callback('');
    // If only one line, treat as comma-separated list
    if (lines.length === 1) {
      const courses = lines[0].replace(/"/g, '').split(',').map(s => s.trim()).filter(Boolean);
      return callback(courses.join(', '));
    }
    // If header present, skip it
    let startIdx = 0;
    if (/^courses?/i.test(lines[0].replace(/"/g, ''))) {
      startIdx = 1;
    }
    // Collect all values in the first column (if columnar)
    let allCourses: string[] = [];
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i].replace(/"/g, '');
      // If comma-separated, split and add all
      const parts = line.split(',').map(s => s.trim()).filter(Boolean);
      allCourses.push(...parts);
    }
    // Deduplicate
    const uniqueCourses = Array.from(new Set(allCourses));
    callback(uniqueCourses.join(', '));
  };
  reader.readAsText(file);
}
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlayCircle, FileText, BookOpen, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface InputSectionProps {
  studentData: string;
  courseList: string;
  onStudentDataChange: (value: string) => void;
  onCourseListChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

export function InputSection({
  studentData,
  courseList,
  onStudentDataChange,
  onCourseListChange,
  onGenerate,
  isLoading
}: InputSectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex justify-center"
    >
      <Card className="w-full max-w-3xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Input Data</span>
          </CardTitle>
          <CardDescription className="text-sm text-slate-600">
            Enter student enrollments and course list to generate exam schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="student-data" className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              <BookOpen className="w-4 h-4" />
              Student Enrollments
            </Label>
            <div className="flex items-center gap-4 mb-3">
              <label htmlFor="student-csv-upload" className="cursor-pointer px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition">
                <input
                  id="student-csv-upload"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) parseStudentCSV(file, onStudentDataChange);
                  }}
                />
                Upload CSV
              </label>
              <span className="text-xs text-blue-700 font-medium">Upload CSV for student enrollments</span>
            </div>
            <Textarea
              id="student-data"
              placeholder="S1: Math, Physics\nS2: Physics, Chemistry\nS3: Math, CS"
              value={studentData}
              onChange={(e) => onStudentDataChange(e.target.value)}
              rows={6}
              className="font-mono text-base border-2 border-blue-200 focus:border-blue-400 rounded-lg shadow-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-list" className="flex items-center gap-2 text-lg font-semibold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              <BookOpen className="w-4 h-4" />
              Course List
            </Label>
            <div className="flex items-center gap-4 mb-3">
              <label htmlFor="course-csv-upload" className="cursor-pointer px-4 py-2 rounded bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold shadow hover:from-blue-700 hover:to-purple-700 transition">
                <input
                  id="course-csv-upload"
                  type="file"
                  accept=".csv,text/csv"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) parseCoursesCSV(file, onCourseListChange);
                  }}
                />
                Upload CSV
              </label>
              <span className="text-xs text-blue-700 font-medium">Upload CSV for course list</span>
            </div>
            <Input
              id="course-list"
              placeholder="Math, Physics, Chemistry, CS"
              value={courseList}
              onChange={(e) => onCourseListChange(e.target.value)}
              className="font-mono text-base border-2 border-blue-200 focus:border-blue-400 rounded-lg shadow-sm"
            />
          </div>

          <div className="flex justify-center">
            <Button
              onClick={onGenerate}
              disabled={isLoading || !studentData.trim() || !courseList.trim()}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Generating...' : 'Generate Schedule'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}