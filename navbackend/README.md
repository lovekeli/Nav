# 导航后台管理系统 - 部署指南

## 项目结构

```
Nav/
├── navbackend/           # Cloudflare Workers 后端项目
│   ├── src/
│   │   └── index.ts      # 主入口文件
│   ├── sql/
│   │   └── init.sql      # D1 数据库初始化脚本
│   ├── wrangler.toml     # Wrangler 配置文件
│   ├── package.json
│   └── tsconfig.json
└── public/
    └── admin/            # 后台管理前端页面
        ├── login.html    # 登录页
        └── index.html    # 后台主页
```

## 部署步骤

### 1. 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 2. 登录 Cloudflare

```bash
wrangler login
```

### 3. 初始化项目

```bash
cd navbackend
npm install
```

### 4. 创建 D1 数据库

```bash
npm run db:create
```

创建成功后，会输出数据库 ID。将 ID 填入 `wrangler.toml` 中的 `database_id` 字段：

```toml
[[d1_databases]]
binding = "DB"
database_name = "nav-database"
database_id = "你的数据库ID"  # 填入这里
```

### 5. 执行数据库初始化

```bash
npm run db:migrate
```

### 6. 配置管理员凭据

编辑 `wrangler.toml`，修改 `ADMIN_CREDENTIALS` 变量：

```toml
[vars]
ADMIN_CREDENTIALS = "admin:你的密码"  # 格式: 用户名:密码
```

### 7. 部署到 Cloudflare Workers

```bash
npm run deploy
```

部署成功后，会输出 Workers 的访问地址，例如：
```
https://navbackend.yourusername.workers.dev
```

### 8. 配置前端 API 地址

编辑 `public/admin/login.html` 和 `public/admin/index.html`，将 `API_BASE_URL` 修改为你的 Workers 地址：

```javascript
const API_BASE_URL = 'https://navbackend.yourusername.workers.dev';
```

## 本地开发

### 启动本地服务器

```bash
cd navbackend
npm run dev
```

本地服务器默认运行在 `http://localhost:8787`

### 本地数据库迁移

```bash
npm run db:migrate:local
```

## API 接口文档

### 认证

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/login` | POST | 用户登录，返回 JWT Token |

### 概览

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/overview` | GET | 获取概览数据 |
| `/api/export` | GET | 导出完整 data.json |

### 分组管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/groups` | GET | 获取所有分组 |
| `/api/groups` | POST | 创建分组 |
| `/api/groups/:id` | PUT | 更新分组 |
| `/api/groups/:id` | DELETE | 删除分组 |

### 搜索管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/search-configs` | GET | 获取搜索配置 |
| `/api/search-configs` | POST | 创建搜索配置 |
| `/api/search-configs/:id` | PUT | 更新搜索配置 |
| `/api/search-configs/:id` | DELETE | 删除搜索配置 |
| `/api/search-configs/:id/engines` | GET | 获取搜索引擎列表 |
| `/api/search-engines` | POST | 创建搜索引擎 |
| `/api/search-engines/:id` | PUT | 更新搜索引擎 |
| `/api/search-engines/:id` | DELETE | 删除搜索引擎 |

### 链接管理

| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/links` | GET | 获取所有链接 |
| `/api/links` | POST | 创建链接 |
| `/api/links/:id` | PUT | 更新链接 |
| `/api/links/:id` | DELETE | 删除链接 |

## 使用流程

1. 访问 `public/admin/login.html` 登录后台
2. 在后台管理界面进行分组、搜索配置、链接的增删改查
3. 点击"导出JSON"按钮，下载最新的 `data.json`
4. 将下载的 `data.json` 替换 `public/js/data.json`
5. 重新部署前端项目（如使用 GitHub Pages 则推送代码即可）

## 注意事项

- JWT Token 有效期为 24 小时
- 删除分组会级联删除该分组下的所有链接
- 删除搜索配置会级联删除该配置下的所有搜索引擎
- 生产环境建议启用 Cloudflare 的访问限制和防火墙规则
