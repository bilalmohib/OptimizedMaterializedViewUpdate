# 📝 TODO System with Materialized View and Delta Strategy

A high-performance TODO system built with Supabase, implementing a layered architecture for efficient data handling and real-time updates.

## 🎯 Goal

Build a scalable TODO system that efficiently serves large volumes of TODOs with near real-time accuracy using a layered architecture:

- Source Table (`todos`)
- Materialized Snapshot (`main_todos`)
- Delta Store (`delta_todos`)
- Unified Real-Time View (`combined_todos`)

## 🏗️ Architecture Overview

```pgsql
          +-----------------+
          |     todos       |  <-- All inserts/updates
          +-----------------+
                  │
          (trigger on insert/update)
                  ▼
          +-----------------+
          |   delta_todos   |  <-- Recent changes
          +-----------------+
                  │
       +---------------------------+
       |    combined_todos (VIEW)  |  <-- UNION of materialized and delta
       +---------------------------+
         ▲                    ▲
         |                    |
+----------------+   +----------------------+
| main_todos     |   | View Excludes Deltas |
| (Materialized) |   | to avoid duplication |
+----------------+   +----------------------+
```

## 📚 Database Schema

### 1. Source Table: `todos`

```sql
CREATE TABLE IF NOT EXISTS todos (
  id         BIGSERIAL      PRIMARY KEY,
  title      TEXT           NOT NULL,
  completed  BOOLEAN        NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ    NOT NULL DEFAULT now()
);
```

### 2. Snapshot Table: `main_todos` (Materialized View)

```sql
DROP MATERIALIZED VIEW IF EXISTS main_todos;
CREATE MATERIALIZED VIEW main_todos AS
SELECT id, title, completed, updated_at
  FROM todos;
```

### 3. Delta Table: `delta_todos`

```sql
DROP TABLE IF EXISTS delta_todos;
CREATE TABLE delta_todos (
  id         BIGINT         PRIMARY KEY,
  title      TEXT           NOT NULL,
  completed  BOOLEAN        NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ    NOT NULL
);
```

### 4. Unique Index for Efficient Upserts

```sql
CREATE UNIQUE INDEX IF NOT EXISTS idx_delta_pk
  ON delta_todos(id);
```

## 🔄 Synchronization

### Trigger Function for Delta Syncing

```sql
CREATE OR REPLACE FUNCTION upsert_delta_todo()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  INSERT INTO delta_todos (id, title, completed, updated_at)
    VALUES (NEW.id, NEW.title, NEW.completed, NEW.updated_at)
  ON CONFLICT (id) DO UPDATE
    SET title      = EXCLUDED.title,
        completed  = EXCLUDED.completed,
        updated_at = EXCLUDED.updated_at;
  RETURN NEW;
END;
$$;
```

### Attach Trigger to `todos`

```sql
DROP TRIGGER IF EXISTS trg_todos_changes ON todos;
CREATE TRIGGER trg_todos_changes
  AFTER INSERT OR UPDATE ON todos
  FOR EACH ROW EXECUTE FUNCTION upsert_delta_todo();
```

### Real-Time Combined View: `combined_todos`

```sql
DROP VIEW IF EXISTS combined_todos;
CREATE VIEW combined_todos AS
  SELECT * 
    FROM delta_todos
  UNION ALL
  SELECT m.*
    FROM main_todos AS m
   WHERE NOT EXISTS (
     SELECT 1 
       FROM delta_todos AS d 
      WHERE d.id = m.id
   );
```

## 🧪 Testing & Setup

### Optional: Reset All Data

```sql
TRUNCATE todos RESTART IDENTITY CASCADE;
TRUNCATE delta_todos;
```

### Insert Test Data (100,000 Records)

```sql
INSERT INTO todos (title, completed, updated_at)
SELECT
  'Task #' || gs        AS title,
  FALSE                 AS completed,
  NOW()                 AS updated_at
FROM generate_series(1, 100000) AS gs;
```

### Ensure Index on `main_todos`

```sql
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
     WHERE schemaname = 'public'
       AND tablename  = 'main_todos'
       AND indexname  = 'idx_main_todos_pk'
  ) THEN
    CREATE UNIQUE INDEX idx_main_todos_pk
      ON main_todos(id);
  END IF;
END;
$$;
```

### Refresh Materialized View

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY main_todos;
```

### Verify Data Counts

```sql
SELECT
  (SELECT count(*) FROM todos)      AS total_todos,
  (SELECT count(*) FROM main_todos) AS matview_rows;
```

### Clear Deltas (for testing)

```sql
TRUNCATE TABLE delta_todos;
```

## ✅ Key Features & Benefits

| Feature/Issue | Resolution |
|---------------|------------|
| Inefficient querying of all todos | Introduced `main_todos` as a materialized snapshot |
| Delayed data updates | Used `delta_todos` + trigger for real-time syncing |
| Duplicate ID risk in combined view | Used NOT EXISTS logic in `combined_todos` |
| Manual refresh handling | Setup for concurrent refresh of `main_todos` |
| Data indexing for performance | Created unique indexes for fast access/upsert |
| Clear separation of hot vs cold data | Recent (hot) data in `delta_todos`, bulk (cold) in `main_todos` |

## 🚀 Getting Started

1. Clone the repository
2. Set up your Supabase project
3. Run the SQL scripts in order
4. Start the application

## 📝 License

MIT License