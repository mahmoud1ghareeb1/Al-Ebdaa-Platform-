export type View = 'home' | 'lectures' | 'exams' | 'grades' | 'account' | 'honorBoard' | 'homework' | 'notes' | 'photos';

// From profiles table
export interface StudentProfile {
  id: string; // uuid
  full_name: string;
  avatar_url: string;
  class: 'الصف الأول الثانوى' | 'الصف الثانى الثانوى' | 'الصف الثالث الثانوى';
  group: 'مجموعة 1' | 'مجموعة 2' | 'ابو حماد';
  phone_number: string;
  parent_phone_number: string;
  student_code: string;
}

// From lectures table
export interface Lecture {
  id: number;
  title: string;
  thumbnail_url: string;
  video_url: string | null;
  // This will be added dynamically after fetching
  watched?: boolean;
}

// From exams table
export interface Exam {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  duration_minutes: number | null;
  total_grade: number;
  // This will be added dynamically
  status?: 'available' | 'missed' | 'taken';
}

// From submissions table (with exam name joined)
export interface ExamResult {
  id: number; // submission id
  exam_id: number;
  examName: string; // Joined from exams.name
  total_grade: number; // Joined from exams.total_grade
  score: number;
  solve_duration_minutes: number | null;
  created_at: string; // submission date
  examEndDate?: string | null;
  // New detailed stats
  totalQuestions?: number;
  correctAnswers?: number;
  incorrectAnswers?: number;
}

// From honor_board view
export interface HonorStudent {
  id: string;
  full_name: string;
  avatar_url: string;
  total_score: number;
  rank: number;
}

// From photo_sets table
export interface PhotoSet {
    id: number;
    title: string;
    created_at: string;
}

// From photos table
export interface Photo {
    id: number;
    image_url: string;
    photo_set_id: number;
    created_at: string;
}

// From questions table
export interface Question {
    id: number;
    question_text: string;
    question_image_url: string | null;
    options: Option[];
}

// From options table
export interface Option {
    id: number;
    option_text: string;
    is_correct: boolean;
}