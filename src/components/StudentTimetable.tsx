import { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  AlertTriangle,
  CheckCircle,
  BarChart3
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import StudentConflictGraph from './StudentConflictGraph';
import type { Student, ScheduleResult, GraphNode, GraphLink } from '../types';

export default function StudentTimetable() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get student and result data from navigation state
  const student = location.state?.student as Student;
  const result = location.state?.result as ScheduleResult;

  useEffect(() => {
    if (!student || !result) {
      navigate('/search');
    }
  }, [student, result, navigate]);

  if (!student || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">No student data found</h2>
          <Button onClick={() => navigate('/search')}>Go to Search</Button>
        </div>
      </div>
    );
  }

  // Generate student schedule
  const studentSchedule = useMemo(() => {
    const schedule: { 
      course: string; 
      slot: number; 
      time: string; 
      day: number; 
      session: number;
      color?: string;
    }[] = [];
    
    student.courses.forEach(courseName => {
      const course = result.courses.get(courseName);
      if (course && course.slot !== undefined) {
        const day = Math.ceil((course.slot + 1) / 3);
        const session = ((course.slot) % 3) + 1;
        const timeSlot = `Day ${day}, Session ${session}`;
        
        schedule.push({
          course: courseName,
          slot: course.slot,
          time: timeSlot,
          day,
          session,
          color: course.color
        });
      }
    });

    return schedule.sort((a, b) => a.slot - b.slot);
  }, [student, result]);

  // Generate conflict graph for this student's courses
  const studentConflictGraph = useMemo(() => {
    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];
    
    // Add nodes for student's courses
    student.courses.forEach(courseName => {
      const course = result.courses.get(courseName);
      nodes.push({
        id: courseName,
        name: courseName,
        color: course?.color,
        slot: course?.slot
      });
    });

    // Add links for conflicts between student's courses
    for (let i = 0; i < student.courses.length; i++) {
      for (let j = i + 1; j < student.courses.length; j++) {
        const course1 = result.courses.get(student.courses[i]);
        
        if (course1?.conflicts.has(student.courses[j])) {
          links.push({
            source: student.courses[i],
            target: student.courses[j]
          });
        }
      }
    }

    return { nodes, links };
  }, [student, result]);

  // Calculate student-specific statistics
  const studentStats = useMemo(() => {
    const totalCourses = student.courses.length;
    const scheduledCourses = studentSchedule.length;
    const conflicts = studentConflictGraph.links.length;
    const uniqueSlots = new Set(studentSchedule.map(s => s.slot)).size;
    const maxDay = Math.max(...studentSchedule.map(s => s.day), 0);
    
    return {
      totalCourses,
      scheduledCourses,
      conflicts,
      uniqueSlots,
      maxDay,
      efficiency: totalCourses > 0 ? Math.round((scheduledCourses / totalCourses) * 100) : 0
    };
  }, [student, studentSchedule, studentConflictGraph]);

  // Group schedule by day and session
  const scheduleGrid = useMemo(() => {
    const grid: { [day: number]: { [session: number]: any } } = {};
    
    studentSchedule.forEach(item => {
      if (!grid[item.day]) grid[item.day] = {};
      grid[item.day][item.session] = item;
    });
    
    return grid;
  }, [studentSchedule]);

  const maxDays = Math.max(...Object.keys(scheduleGrid).map(Number), 3);
  const sessions = [1, 2, 3];

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-7xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => navigate('/search')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Search
          </Button>
          
          <div className="flex-1">
            <motion.h1
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3"
            >
              <div className="p-2 bg-blue-100 rounded-full">
                <User className="w-6 h-6 text-blue-600" />
              </div>
              {student.id}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-slate-600 mt-1"
            >
              Personal Timetable & Conflict Analysis
            </motion.p>
          </div>
        </div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <BookOpen className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-700">{studentStats.totalCourses}</div>
              <div className="text-xs text-blue-600">Total Courses</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-700">{studentStats.scheduledCourses}</div>
              <div className="text-xs text-green-600">Scheduled</div>
            </CardContent>
          </Card>
          
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="p-4 text-center">
              <AlertTriangle className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-700">{studentStats.conflicts}</div>
              <div className="text-xs text-orange-600">Conflicts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-700">{studentStats.uniqueSlots}</div>
              <div className="text-xs text-purple-600">Time Slots</div>
            </CardContent>
          </Card>
          
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4 text-center">
              <Calendar className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-700">{studentStats.maxDay}</div>
              <div className="text-xs text-indigo-600">Exam Days</div>
            </CardContent>
          </Card>
          
          <Card className="bg-pink-50 border-pink-200">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-6 h-6 text-pink-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-pink-700">{studentStats.efficiency}%</div>
              <div className="text-xs text-pink-600">Efficiency</div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Tabs defaultValue="timetable" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="timetable">Timetable</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="conflicts">Conflict Graph</TabsTrigger>
            </TabsList>

            {/* Timetable Tab */}
            <TabsContent value="timetable" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Exam Schedule
                  </CardTitle>
                  <CardDescription>
                    Your personalized exam timetable showing all scheduled courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr>
                          <th className="border border-slate-200 bg-slate-50 p-3 text-left font-medium">
                            Day / Session
                          </th>
                          {sessions.map(session => (
                            <th key={session} className="border border-slate-200 bg-slate-50 p-3 text-center font-medium">
                              Session {session}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {Array.from({ length: maxDays }, (_, i) => i + 1).map(day => (
                          <tr key={day}>
                            <td className="border border-slate-200 bg-slate-50 p-3 font-medium">
                              Day {day}
                            </td>
                            {sessions.map(session => {
                              const item = scheduleGrid[day]?.[session];
                              return (
                                <td key={session} className="border border-slate-200 p-2">
                                  {item ? (
                                    <div className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
                                      <div className="font-medium text-slate-800 text-sm mb-1">
                                        {item.course}
                                      </div>
                                      <Badge 
                                        variant="secondary" 
                                        className="text-xs"
                                        style={{ backgroundColor: item.color + '20', borderColor: item.color }}
                                      >
                                        Slot {item.slot + 1}
                                      </Badge>
                                    </div>
                                  ) : (
                                    <div className="p-3 text-center text-slate-400 text-sm">
                                      Free
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Courses Tab */}
            <TabsContent value="courses" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    Enrolled Courses
                  </CardTitle>
                  <CardDescription>
                    Complete list of your enrolled courses with scheduling details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentSchedule.map((item, index) => (
                      <motion.div
                        key={item.course}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full border-2"
                            style={{ backgroundColor: item.color, borderColor: item.color }}
                          ></div>
                          <div>
                            <div className="font-medium text-slate-800">{item.course}</div>
                            <div className="text-sm text-slate-600">{item.time}</div>
                          </div>
                        </div>
                        <Badge variant="outline">
                          Slot {item.slot + 1}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Conflict Graph Tab */}
            <TabsContent value="conflicts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    Course Conflict Analysis
                  </CardTitle>
                  <CardDescription>
                    Visual representation of conflicts between your enrolled courses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {studentConflictGraph.links.length > 0 ? (
                    <div>
                      <Alert className="mb-6">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          This graph shows {studentConflictGraph.links.length} conflict(s) between your courses.
                          Courses connected by lines cannot be scheduled at the same time.
                        </AlertDescription>
                      </Alert>
                      <div className="w-full">
                        <StudentConflictGraph 
                          nodes={studentConflictGraph.nodes}
                          links={studentConflictGraph.links}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-700 mb-2">
                        No Conflicts Detected!
                      </h3>
                      <p className="text-slate-600">
                        All your enrolled courses can be scheduled without any conflicts.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </div>
  );
}
