import { Student, Course, ScheduleResult } from '../types';

export const SLOT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#84CC16', // Lime
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

export function parseStudentData(input: string): Student[] {
  const lines = input.trim().split('\n');
  const students: Student[] = [];

  lines.forEach(line => {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, id, coursesStr] = match;
      const courses = coursesStr.split(',').map(c => c.trim());
      students.push({ id, courses });
    }
  });

  return students;
}

export function parseCourseList(input: string): string[] {
  return input.split(',').map(c => c.trim()).filter(c => c.length > 0);
}

export function buildConflictGraph(students: Student[], courseNames: string[]): Map<string, Course> {
  const courses = new Map<string, Course>();
  
  // Initialize courses
  courseNames.forEach(name => {
    courses.set(name, { name, conflicts: new Set() });
  });

  // Build conflict edges
  students.forEach(student => {
    for (let i = 0; i < student.courses.length; i++) {
      for (let j = i + 1; j < student.courses.length; j++) {
        const course1 = student.courses[i];
        const course2 = student.courses[j];
        
        if (courses.has(course1) && courses.has(course2)) {
          courses.get(course1)!.conflicts.add(course2);
          courses.get(course2)!.conflicts.add(course1);
        }
      }
    }
  });

  return courses;
}

export function greedyColoring(courses: Map<string, Course>): ScheduleResult {
  const courseList = Array.from(courses.values());
  const slots = new Map<number, string[]>();
  let totalConflicts = 0;

  // Sort by degree (number of conflicts) descending
  courseList.sort((a, b) => b.conflicts.size - a.conflicts.size);

  courseList.forEach(course => {
    totalConflicts += course.conflicts.size;
    
    // Find the smallest available slot
    let slot = 1;
    const conflictSlots = new Set<number>();
    
    course.conflicts.forEach(conflictCourse => {
      const conflictCourseObj = courses.get(conflictCourse);
      if (conflictCourseObj && conflictCourseObj.slot) {
        conflictSlots.add(conflictCourseObj.slot);
      }
    });

    while (conflictSlots.has(slot)) {
      slot++;
    }

    course.slot = slot;
    course.color = SLOT_COLORS[(slot - 1) % SLOT_COLORS.length];

    if (!slots.has(slot)) {
      slots.set(slot, []);
    }
    slots.get(slot)!.push(course.name);
  });

  // Conflicts are counted twice (once for each direction)
  totalConflicts = totalConflicts / 2;

  return {
    courses,
    slots,
    totalSlots: slots.size,
    totalConflicts
  };
}