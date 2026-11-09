CREATE SCHEMA IF NOT EXISTS admin;

CREATE TABLE IF NOT EXISTS admin.crm_contacts (
  user_id uuid PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'new'
    CHECK (status IN ('new', 'lead', 'active', 'customer', 'churned')),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL CHECK (length(trim(title)) > 0),
  description text,
  status text NOT NULL DEFAULT 'todo'
    CHECK (status IN ('todo', 'in_progress', 'done')),
  priority text NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high')),
  due_date date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_tasks_status_due_date_idx
  ON admin.tasks (status, due_date);

CREATE INDEX IF NOT EXISTS admin_tasks_created_at_idx
  ON admin.tasks (created_at DESC);
