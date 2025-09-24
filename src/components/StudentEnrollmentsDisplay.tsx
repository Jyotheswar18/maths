import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface Student {
  id: string;
  courses: string[];
}

interface StudentEnrollmentsDisplayProps {
  students: Student[];
}

export function StudentEnrollmentsDisplay({ students }: StudentEnrollmentsDisplayProps) {
  if (!students || students.length === 0) return null;

  // Extract all unique courses from all students
  const allCourses = new Set<string>();
  students.forEach(student => {
    student.courses.forEach(course => allCourses.add(course));
  });

  const uniqueCourses = Array.from(allCourses).sort();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Subjects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {uniqueCourses.map((course, index) => (
              <motion.div
                key={course}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
                className="p-3 rounded-lg border border-gray-200 bg-gradient-to-br from-slate-50 to-blue-50 hover:shadow-md transition-shadow text-center"
              >
                <span className="font-medium text-gray-800">{course}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Summary */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">{uniqueCourses.length}</div>
                <div className="text-sm text-gray-600">Total Subjects</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{students.length}</div>
                <div className="text-sm text-gray-600">Total Students</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round((students.reduce((sum, student) => sum + student.courses.length, 0) / students.length) * 10) / 10}
                </div>
                <div className="text-sm text-gray-600">Avg Subjects/Student</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
