import React, { useState } from 'react';
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
import { PlayCircle, FileText, BookOpen } from 'lucide-react';

interface InputSectionProps {
  studentData: string;
  courseList: string;
  onStudentDataChange: (value: string) => void;
  onCourseListChange: (value: string) => void;
  onGenerate: () => void;
  isLoading: boolean;
}

const exampleData = `S1: Math, Physics
S2: Physics, Chemistry
S3: Math, CS
S4: Chemistry, Biology
S5: CS, Math`;

const exampleCourses = "Math, Physics, Chemistry, CS, Biology";

export function InputSection({
  studentData,
  courseList,
  onStudentDataChange,
  onCourseListChange,
  onGenerate,
  isLoading
}: InputSectionProps) {
  const [showExample, setShowExample] = useState(false);

  const loadExample = () => {
    onStudentDataChange(exampleData);
    onCourseListChange(exampleCourses);
    setShowExample(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full flex justify-center"
    >
      <Card className="w-full max-w-3xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-3xl font-extrabold bg-gradient-to-r from-blue-700 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg">
            <FileText className="w-7 h-7 text-blue-600" />
            <span>Input Data</span>
          </CardTitle>
          <CardDescription className="text-base text-slate-600">
            Enter student enrollments and course list to generate exam schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="student-data" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              <BookOpen className="w-5 h-5" />
              Student Enrollments
            </Label>
            <Textarea
              id="student-data"
              placeholder="S1: Math, Physics\nS2: Physics, Chemistry\nS3: Math, CS"
              value={studentData}
              onChange={(e) => onStudentDataChange(e.target.value)}
              rows={6}
              className="font-mono text-base border-2 border-blue-200 focus:border-blue-400 rounded-lg shadow-sm"
            />
            <div className="flex items-center gap-4 mt-2">
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="course-list" className="flex items-center gap-2 text-xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              <BookOpen className="w-5 h-5" />
              Course List
            </Label>
            <Input
              id="course-list"
              placeholder="Math, Physics, Chemistry, CS"
              value={courseList}
              onChange={(e) => onCourseListChange(e.target.value)}
              className="font-mono text-base border-2 border-blue-200 focus:border-blue-400 rounded-lg shadow-sm"
            />
            <div className="flex items-center gap-4 mt-2">
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
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={onGenerate}
              disabled={isLoading || !studentData.trim() || !courseList.trim()}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <PlayCircle className="w-4 h-4 mr-2" />
              {isLoading ? 'Generating...' : 'Generate Schedule'}
            </Button>
            
            <Button
              variant="outline"
              onClick={loadExample}
              className="flex-1 sm:flex-none"
            >
              Load Example
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}