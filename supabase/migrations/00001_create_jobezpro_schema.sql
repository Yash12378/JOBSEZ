-- Create sessions table for anonymous user tracking
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  last_active TIMESTAMPTZ DEFAULT now(),
  user_data JSONB DEFAULT '{}'::jsonb
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS resumes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL,
  parsed_data JSONB DEFAULT '{}'::jsonb,
  analysis_result JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

-- Create skill_gaps table
CREATE TABLE IF NOT EXISTS skill_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  resume_id UUID,
  current_skills JSONB DEFAULT '[]'::jsonb,
  target_role TEXT,
  identified_gaps JSONB DEFAULT '[]'::jsonb,
  market_demand JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

-- Create learning_paths table
CREATE TABLE IF NOT EXISTS learning_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  skill_gap_id UUID,
  recommendations JSONB DEFAULT '[]'::jsonb,
  priority_order JSONB DEFAULT '[]'::jsonb,
  estimated_duration TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (skill_gap_id) REFERENCES skill_gaps(id) ON DELETE SET NULL
);

-- Create mock_interviews table
CREATE TABLE IF NOT EXISTS mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  job_role TEXT NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  feedback JSONB DEFAULT '{}'::jsonb,
  score INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

-- Create skill_assessments table
CREATE TABLE IF NOT EXISTS skill_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  skill_category TEXT NOT NULL,
  questions JSONB DEFAULT '[]'::jsonb,
  answers JSONB DEFAULT '[]'::jsonb,
  results JSONB DEFAULT '{}'::jsonb,
  score INTEGER,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

-- Create job_matches table
CREATE TABLE IF NOT EXISTS job_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  resume_id UUID,
  job_title TEXT NOT NULL,
  company TEXT,
  location TEXT,
  description TEXT,
  requirements JSONB DEFAULT '[]'::jsonb,
  compatibility_score INTEGER,
  match_details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE,
  FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE SET NULL
);

-- Create storage bucket for resumes
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-9lzawza7xw5d_resumes_files', 'app-9lzawza7xw5d_resumes_files', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for resume uploads (public access for anonymous users)
CREATE POLICY "Anyone can upload resumes"
ON storage.objects FOR INSERT
TO anon, authenticated
WITH CHECK (bucket_id = 'app-9lzawza7xw5d_resumes_files');

CREATE POLICY "Anyone can read resumes"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'app-9lzawza7xw5d_resumes_files');

CREATE POLICY "Anyone can delete their resumes"
ON storage.objects FOR DELETE
TO anon, authenticated
USING (bucket_id = 'app-9lzawza7xw5d_resumes_files');

-- RLS Policies (public access for anonymous users)
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_matches ENABLE ROW LEVEL SECURITY;

-- Sessions policies
CREATE POLICY "Anyone can insert sessions"
ON sessions FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read sessions"
ON sessions FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update sessions"
ON sessions FOR UPDATE
TO anon, authenticated
USING (true);

-- Resumes policies
CREATE POLICY "Anyone can insert resumes"
ON resumes FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read resumes"
ON resumes FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update resumes"
ON resumes FOR UPDATE
TO anon, authenticated
USING (true);

-- Skill gaps policies
CREATE POLICY "Anyone can insert skill_gaps"
ON skill_gaps FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read skill_gaps"
ON skill_gaps FOR SELECT
TO anon, authenticated
USING (true);

-- Learning paths policies
CREATE POLICY "Anyone can insert learning_paths"
ON learning_paths FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read learning_paths"
ON learning_paths FOR SELECT
TO anon, authenticated
USING (true);

-- Mock interviews policies
CREATE POLICY "Anyone can insert mock_interviews"
ON mock_interviews FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read mock_interviews"
ON mock_interviews FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update mock_interviews"
ON mock_interviews FOR UPDATE
TO anon, authenticated
USING (true);

-- Skill assessments policies
CREATE POLICY "Anyone can insert skill_assessments"
ON skill_assessments FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read skill_assessments"
ON skill_assessments FOR SELECT
TO anon, authenticated
USING (true);

CREATE POLICY "Anyone can update skill_assessments"
ON skill_assessments FOR UPDATE
TO anon, authenticated
USING (true);

-- Job matches policies
CREATE POLICY "Anyone can insert job_matches"
ON job_matches FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Anyone can read job_matches"
ON job_matches FOR SELECT
TO anon, authenticated
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_resumes_session_id ON resumes(session_id);
CREATE INDEX IF NOT EXISTS idx_skill_gaps_session_id ON skill_gaps(session_id);
CREATE INDEX IF NOT EXISTS idx_learning_paths_session_id ON learning_paths(session_id);
CREATE INDEX IF NOT EXISTS idx_mock_interviews_session_id ON mock_interviews(session_id);
CREATE INDEX IF NOT EXISTS idx_skill_assessments_session_id ON skill_assessments(session_id);
CREATE INDEX IF NOT EXISTS idx_job_matches_session_id ON job_matches(session_id);