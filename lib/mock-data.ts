// Mock data for the Xam application

export interface Project {
  id: string
  name: string
  type: "test" | "essay" | "survey"
  status: "draft" | "published" | "archived"
  createdAt: string
  updatedAt: string
  submissions: number
  totalMarks: number
  thumbnail?: string
}

export interface Submission {
  id: string
  studentName: string
  email: string
  submittedAt: string
  status: "submitted" | "marked" | "returned"
  grade: number
  totalMarks: number
  percentage: number
  timeTaken: number
  flagged?: boolean
}

export const mockProjects: Project[] = [
  {
    id: "test_001",
    name: "Biology Midterm Exam",
    type: "test",
    status: "published",
    createdAt: "2025-10-15",
    updatedAt: "2025-10-28",
    submissions: 18,
    totalMarks: 50,
  },
  {
    id: "test_002",
    name: "World History Quiz",
    type: "test",
    status: "published",
    createdAt: "2025-10-20",
    updatedAt: "2025-11-01",
    submissions: 24,
    totalMarks: 30,
  },
  {
    id: "essay_001",
    name: "Climate Change Essay",
    type: "essay",
    status: "published",
    createdAt: "2025-10-10",
    updatedAt: "2025-10-25",
    submissions: 15,
    totalMarks: 100,
  },
  {
    id: "survey_001",
    name: "Course Feedback Survey",
    type: "survey",
    status: "published",
    createdAt: "2025-11-01",
    updatedAt: "2025-11-03",
    submissions: 32,
    totalMarks: 0,
  },
  {
    id: "test_003",
    name: "Math Practice Test",
    type: "test",
    status: "draft",
    createdAt: "2025-11-05",
    updatedAt: "2025-11-05",
    submissions: 0,
    totalMarks: 40,
  },
  {
    id: "essay_002",
    name: "Shakespeare Analysis",
    type: "essay",
    status: "draft",
    createdAt: "2025-11-04",
    updatedAt: "2025-11-06",
    submissions: 0,
    totalMarks: 50,
  },
]

export const mockSubmissions: Submission[] = [
  {
    id: "sub_001",
    studentName: "Emma Johnson",
    email: "emma.j@school.edu",
    submittedAt: "2025-11-05T14:23:00Z",
    status: "marked",
    grade: 41,
    totalMarks: 50,
    percentage: 82,
    timeTaken: 2280,
  },
  {
    id: "sub_002",
    studentName: "Liam Chen",
    email: "liam.c@school.edu",
    submittedAt: "2025-11-05T15:10:00Z",
    status: "marked",
    grade: 45,
    totalMarks: 50,
    percentage: 90,
    timeTaken: 1920,
  },
  {
    id: "sub_003",
    studentName: "Sophia Martinez",
    email: "sophia.m@school.edu",
    submittedAt: "2025-11-05T16:45:00Z",
    status: "submitted",
    grade: 0,
    totalMarks: 50,
    percentage: 0,
    timeTaken: 2640,
  },
  {
    id: "sub_004",
    studentName: "Noah Williams",
    email: "noah.w@school.edu",
    submittedAt: "2025-11-05T17:20:00Z",
    status: "submitted",
    grade: 0,
    totalMarks: 50,
    percentage: 0,
    timeTaken: 2100,
    flagged: true,
  },
  {
    id: "sub_005",
    studentName: "Olivia Brown",
    email: "olivia.b@school.edu",
    submittedAt: "2025-11-05T18:05:00Z",
    status: "marked",
    grade: 38,
    totalMarks: 50,
    percentage: 76,
    timeTaken: 2520,
  },
]
