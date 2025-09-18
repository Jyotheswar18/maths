import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Calendar, List, Clock } from 'lucide-react';
import { ScheduleResult } from '../types';

interface TimetableViewProps {
  result: ScheduleResult | null;
}

export function TimetableView({ result }: TimetableViewProps) {
  const [isTableView, setIsTableView] = React.useState(true);

  if (!result) return null;

  const sortedSlots = Array.from(result.slots.entries()).sort(([a], [b]) => a - b);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Exam Schedule
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Label htmlFor="view-toggle" className="text-sm">
                <List className="w-4 h-4 inline mr-1" />
                List
              </Label>
              <Switch
                id="view-toggle"
                checked={isTableView}
                onCheckedChange={setIsTableView}
              />
              <Label htmlFor="view-toggle" className="text-sm">
                <Calendar className="w-4 h-4 inline mr-1" />
                Table
              </Label>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {isTableView ? (
              <motion.div
                key="table"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Courses</TableHead>
                      <TableHead>Count</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSlots.map(([slot, courses]) => (
                      <TableRow key={slot}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: result.courses.get(courses[0])?.color }}
                            />
                            <Clock className="w-4 h-4 text-gray-500" />
                            Slot {slot}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {courses.map((course) => (
                              <span
                                key={course}
                                className="px-2 py-1 rounded-full text-xs font-medium text-white"
                                style={{ backgroundColor: result.courses.get(course)?.color }}
                              >
                                {course}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>{courses.length}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </motion.div>
            ) : (
              <motion.div
                key="list"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {sortedSlots.map(([slot, courses], index) => (
                  <motion.div
                    key={slot}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-gray-200 bg-gray-50"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="w-6 h-6 rounded-full"
                        style={{ backgroundColor: result.courses.get(courses[0])?.color }}
                      />
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Time Slot {slot}
                      </h3>
                      <span className="text-sm text-gray-500">
                        ({courses.length} course{courses.length > 1 ? 's' : ''})
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {courses.map((course) => (
                        <motion.div
                          key={course}
                          whileHover={{ scale: 1.05 }}
                          className="px-3 py-2 rounded-lg text-center font-medium text-white shadow-sm"
                          style={{ backgroundColor: result.courses.get(course)?.color }}
                        >
                          {course}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}