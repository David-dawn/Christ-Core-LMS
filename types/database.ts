export type Role = "student" | "admin";
export type Track = "frontend" | "uiux" | "animation";
export type SkillLevel = "beginner" | "intermediate" | "advanced";
export type TaskStatus = "draft" | "published" | "closed";
export type SubmissionStatus = "submitted" | "graded";
export type AttendanceStatus = "present" | "absent";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Profile = {
  id: string;
  full_name: string;
  email: string | null;
  role: Role;
  track: Track | null;
  skill_level: SkillLevel | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  instructions: string | null;
  requirements: string | null;
  resources: Json;
  deadline: string | null;
  max_score: number;
  status: TaskStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Submission = {
  id: string;
  task_id: string;
  student_id: string;
  github_url: string;
  deployment_url: string;
  comment: string | null;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
  submitted_at: string;
  graded_at: string | null;
  graded_by: string | null;
  updated_at: string;
};

export type Attendance = {
  id: string;
  student_id: string;
  session_date: string;
  status: AttendanceStatus;
  marked_by: string | null;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  created_by: string | null;
  created_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & Pick<Profile, "id" | "full_name">;
        Update: Partial<Profile>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Partial<Task>, "id" | "created_at" | "updated_at"> & Pick<Task, "title" | "description">;
        Update: Partial<Task>;
      };
      submissions: {
        Row: Submission;
        Insert: Omit<Partial<Submission>, "id" | "submitted_at" | "graded_at" | "updated_at"> &
          Pick<Submission, "task_id" | "student_id" | "github_url" | "deployment_url">;
        Update: Partial<Submission>;
      };
      attendance: {
        Row: Attendance;
        Insert: Omit<Partial<Attendance>, "id" | "created_at"> & Pick<Attendance, "student_id" | "session_date" | "status">;
        Update: Partial<Attendance>;
      };
      announcements: {
        Row: Announcement;
        Insert: Omit<Partial<Announcement>, "id" | "created_at"> & Pick<Announcement, "title" | "content">;
        Update: Partial<Announcement>;
      };
    };
    Views: {};
    Functions: {
      is_admin: {
        Args: { uid?: string };
        Returns: boolean;
      };
    };
    Enums: {};
    CompositeTypes: {};
  };
};
