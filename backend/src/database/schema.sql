

-- tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT DEFAULT '',
    priority INTEGER CHECK(priority IN (1, 2, 3, 4, 5)) NOT NULL DEFAULT 5,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME NULL,
    status TEXT CHECK(status IN ('next', 'ongoing', 'backburner', 'finished')) NOT NULL DEFAULT 'next'
);
