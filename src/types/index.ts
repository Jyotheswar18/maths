export interface Student {
  id: string;
  courses: string[];
}

export interface Course {
  name: string;
  conflicts: Set<string>;
  color?: string;
  slot?: number;
}

export interface GraphNode {
  id: string;
  name: string;
  color?: string;
  slot?: number;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface ScheduleResult {
  courses: Map<string, Course>;
  slots: Map<number, string[]>;
  totalSlots: number;
  totalConflicts: number;
  students?: Student[];
  averageConflictsPerCourse?: number;
  conflictDetails?: {
    totalPairs: number;
    conflictPairsList: string[][];
  };
}