import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, GitBranch, Clock, TrendingUp } from 'lucide-react';
import { ScheduleResult } from '../types';

interface StatisticsPanelProps {
  result: ScheduleResult | null;
}

export function StatisticsPanel({ result }: StatisticsPanelProps) {
  if (!result) return null;

  // Calculate detailed statistics with improved logic
  const totalCourses = result.courses.size;
  const totalSlots = result.totalSlots;
  const totalConflicts = result.totalConflicts;
  
  // Calculate more accurate conflicts per course using actual course data
  const conflictsPerCourse = result.averageConflictsPerCourse || 
    (totalCourses > 0 ? 
      Array.from(result.courses.values()).reduce((sum, course) => sum + course.conflicts.size, 0) / totalCourses 
      : 0
    );
  
  // Calculate efficiency with better logic
  // Efficiency = (Total Courses / Total Slots) * 100
  // Higher percentage means better slot utilization
  const efficiency = totalSlots > 0 ? Math.round((totalCourses / totalSlots) * 100) : 0;
  
  // Calculate average courses per slot (more accurate)
  const avgCoursesPerSlot = totalSlots > 0 ? 
    Math.round((totalCourses / totalSlots) * 10) / 10 : 0;
  
  // Calculate theoretical minimum slots needed (improved formula)
  // For graph coloring, minimum slots = chromatic number
  // Rough estimate: max degree + 1, but more accurately calculated from conflict graph
  const maxDegree = totalCourses > 0 ? 
    Math.max(...Array.from(result.courses.values()).map(course => course.conflicts.size)) : 0;
  const theoreticalMinSlots = Math.max(1, maxDegree + 1);
  
  // Calculate clique number approximation (better theoretical minimum)
  const cliqueApproximation = totalConflicts > 0 ? 
    Math.max(theoreticalMinSlots, Math.ceil(Math.sqrt(totalConflicts * 2))) : 1;

  const stats = [
    {
      title: 'Total Courses',
      value: totalCourses,
      subtitle: `${avgCoursesPerSlot} avg per slot`,
      icon: BookOpen,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Conflicts Resolved',
      value: totalConflicts,
      subtitle: `${Math.round(conflictsPerCourse * 10) / 10} per course`,
      icon: GitBranch,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
    },
    {
      title: 'Time Slots Used',
      value: totalSlots,
      subtitle: totalConflicts > 0 ? `Min theoretical: ${cliqueApproximation}` : 'No conflicts',
      icon: Clock,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Slot Efficiency',
      value: `${efficiency}%`,
      subtitle: getEfficiencyRating(totalSlots, cliqueApproximation),
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  // Helper function to determine efficiency rating
  function getEfficiencyRating(usedSlots: number, minSlots: number): string {
    const optimalRatio = usedSlots / minSlots;
    
    if (optimalRatio <= 1.1) return 'Optimal';
    if (optimalRatio <= 1.3) return 'Excellent';
    if (optimalRatio <= 1.5) return 'Good';
    if (optimalRatio <= 2.0) return 'Fair';
    return 'Poor';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.title}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 * index }}
        >
          <Card className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-shadow`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
                </div>
                <div className={`p-3 rounded-full bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}