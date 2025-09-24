import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, User, BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import type { Student, ScheduleResult } from '../types';

interface StudentSearchProps {
  result: ScheduleResult;
}

export default function StudentSearch({ result }: StudentSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    if (!result.students || !searchTerm.trim()) {
      return result.students || [];
    }
    
    return result.students.filter(student =>
      student.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [result.students, searchTerm]);

  const handleStudentSelect = (student: Student) => {
    navigate(`/student/${encodeURIComponent(student.id)}`, { state: { student, result } });
  };

  const getStudentSchedule = (student: Student) => {
    const schedule: { course: string; slot: number; time: string }[] = [];
    
    student.courses.forEach(courseName => {
      const course = result.courses.get(courseName);
      if (course && course.slot !== undefined) {
        // Convert slot number to time format
        const timeSlot = `Day ${Math.ceil((course.slot + 1) / 3)}, Session ${((course.slot) % 3) + 1}`;
        schedule.push({
          course: courseName,
          slot: course.slot,
          time: timeSlot
        });
      }
    });

    return schedule.sort((a, b) => a.slot - b.slot);
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            Student Search
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-slate-600"
          >
            Search for a student to view their personalized timetable and conflict analysis
          </motion.p>
        </div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative max-w-md mx-auto"
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Enter student name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-12 text-lg border-2 border-slate-200 focus:border-blue-500 rounded-xl"
          />
        </motion.div>

        {/* Results Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="space-y-4"
        >
          {searchTerm.trim() && (
            <div className="text-center text-slate-600">
              Found {filteredStudents.length} student(s) matching "{searchTerm}"
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {(searchTerm.trim() ? filteredStudents : result.students || []).map((student, index) => {
              const schedule = getStudentSchedule(student);
              
              return (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-blue-300"
                        onClick={() => handleStudentSelect(student)}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="truncate">{student.id}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {student.courses.length} courses enrolled
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Course List */}
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2">Enrolled Courses:</h4>
                        <div className="flex flex-wrap gap-1">
                          {student.courses.slice(0, 3).map((course) => (
                            <Badge key={course} variant="secondary" className="text-xs">
                              {course.length > 8 ? course.substring(0, 8) + '...' : course}
                            </Badge>
                          ))}
                          {student.courses.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{student.courses.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Schedule Preview */}
                      <div>
                        <h4 className="font-medium text-slate-700 mb-2 flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Schedule Preview:
                        </h4>
                        <div className="text-sm text-slate-600 space-y-1">
                          {schedule.slice(0, 2).map((item, idx) => (
                            <div key={idx} className="flex justify-between">
                              <span className="truncate flex-1 mr-2">
                                {item.course.length > 12 ? item.course.substring(0, 12) + '...' : item.course}
                              </span>
                              <span className="text-xs text-slate-500">{item.time}</span>
                            </div>
                          ))}
                          {schedule.length > 2 && (
                            <div className="text-xs text-slate-400">
                              +{schedule.length - 2} more slots
                            </div>
                          )}
                        </div>
                      </div>

                      <Button className="w-full" variant="outline">
                        View Full Timetable
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {searchTerm.trim() && filteredStudents.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="p-6 bg-slate-100 rounded-full w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                <Search className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-600 mb-2">No students found</h3>
              <p className="text-slate-500">
                Try searching with a different name or check the spelling.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <Button
            variant="outline"
            onClick={() => navigate('/results')}
            className="px-6 py-2"
          >
            Back to Results
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
