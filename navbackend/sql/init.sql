-- 导航后台 D1 数据库初始化脚本

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  created_at DATETIME DEFAULT (datetime('now'))
);

-- 分?表
CREATE TABLE IF NOT EXISTS groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  icon TEXT DEFAULT 'ti ti-star',
  sort_order INTEGER DEFAULT 0,
  parent_id INTEGER DEFAULT NULL,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

-- 搜索配置表
CREATE TABLE IF NOT EXISTS search_configs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now'))
);

-- 搜索引擎表
CREATE TABLE IF NOT EXISTS search_engines (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  config_id INTEGER NOT NULL,
  engine_id TEXT NOT NULL,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  placeholder TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (config_id) REFERENCES search_configs(id) ON DELETE CASCADE
);

-- 链接表
CREATE TABLE IF NOT EXISTS links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT DEFAULT '',
  sort_order INTEGER DEFAULT 0,
  status INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT (datetime('now')),
  updated_at DATETIME DEFAULT (datetime('now')),
  FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE
);

-- 插入默认管理员（密码需要在部署后手动更新为哈希值）
INSERT OR IGNORE INTO admins (username, password) VALUES ('admin', 'admin123');

-- 插入示例分组
INSERT OR IGNORE INTO groups (title, icon, sort_order) VALUES 
  ('AI团体', 'ti ti-flame', 1),
  ('热搜新闻', 'ti ti-news', 2),
  ('常用推荐', 'ti ti-star', 3),
  ('及时行乐', 'ti ti-disc', 4);
