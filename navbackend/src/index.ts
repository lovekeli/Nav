export interface Env {
  DB: D1Database;
  ADMIN_CREDENTIALS: string;
}

// JWT 密钥（生产环境应使用环境变量）
const JWT_SECRET = 'nav-admin-secret-key-2024';

// 生成 JWT Token
async function generateToken(username: string): Promise<string> {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { username, exp: Math.floor(Date.now() / 1000) + 86400 }; // 24小时过期
  
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = await hmacSHA256(`${encodedHeader}.${encodedPayload}`, JWT_SECRET);
  
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// HMAC-SHA256 签名
async function hmacSHA256(message: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const messageData = encoder.encode(message);
  
  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, messageData);
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// 验证 JWT Token
async function verifyToken(token: string): Promise<{ username: string } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    
    const expectedSignature = await hmacSHA256(`${parts[0]}.${parts[1]}`, JWT_SECRET);
    if (parts[2] !== expectedSignature) return null;
    
    return { username: payload.username };
  } catch {
    return null;
  }
}

// 从 Token 中获取用户名
async function authenticate(request: Request, env: Env): Promise<string | null> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  
  const token = authHeader.slice(7);
  const result = await verifyToken(token);
  return result?.username || null;
}

// JSON 响应
function jsonResponse(data: any, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders()
    }
  });
}

// CORS 头
function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  };
}

// ===== API 路由处理 =====

// 登录接口
async function handleLogin(request: Request, env: Env): Promise<Response> {
  try {
    const { username, password } = await request.json();
    
    // 验证管理员凭据
    const [adminUser, adminPass] = env.ADMIN_CREDENTIALS.split(':');
    if (username !== adminUser || password !== adminPass) {
      return jsonResponse({ error: '用户名或密码错误' }, 401);
    }
    
    const token = await generateToken(username);
    return jsonResponse({ token, message: '登录成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 获取概览数据
async function handleOverview(_request: Request, env: Env): Promise<Response> {
  try {
    // 获取所有分组及链接数量
    const groupsResult = await env.DB.prepare(`
      SELECT g.id, g.title, g.icon, COUNT(l.id) as link_count
      FROM groups g
      LEFT JOIN links l ON g.id = l.group_id
      GROUP BY g.id
      ORDER BY g.sort_order
    `).all();
    
    // 获取总链接数
    const totalResult = await env.DB.prepare('SELECT COUNT(*) as total FROM links').first();
    
    // 获取搜索配置数量
    const searchCountResult = await env.DB.prepare('SELECT COUNT(*) as total FROM search_configs').first();
    
    return jsonResponse({
      groups: groupsResult.results || [],
      totalLinks: (totalResult as any)?.total || 0,
      searchConfigs: (searchCountResult as any)?.total || 0
    });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// ===== 分组管理 =====

// 获取所有分组
async function handleGetGroups(_request: Request, env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare(`
      SELECT g.*, COUNT(l.id) as link_count
      FROM groups g
      LEFT JOIN links l ON g.id = l.group_id
      GROUP BY g.id
      ORDER BY g.sort_order
    `).all();
    return jsonResponse({ data: result.results || [] });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// 创建分组
async function handleCreateGroup(request: Request, env: Env): Promise<Response> {
  try {
    const { title, icon, sort_order, parent_id } = await request.json();
    const result = await env.DB.prepare(`
      INSERT INTO groups (title, icon, sort_order, parent_id) VALUES (?, ?, ?, ?)
    `).bind(title, icon || 'ti ti-star', sort_order || 0, parent_id || null).run();
    
    return jsonResponse({ id: result.meta?.last_row_id, message: '创建成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 更新分组
async function handleUpdateGroup(request: Request, env: Env, id: number): Promise<Response> {
  try {
    const { title, icon, sort_order, parent_id } = await request.json();
    await env.DB.prepare(`
      UPDATE groups SET title = ?, icon = ?, sort_order = ?, parent_id = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(title, icon, sort_order, parent_id || null, id).run();
    
    return jsonResponse({ message: '更新成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 删除分组
async function handleDeleteGroup(_request: Request, env: Env, id: number): Promise<Response> {
  try {
    await env.DB.prepare('DELETE FROM groups WHERE id = ?').bind(id).run();
    return jsonResponse({ message: '删除成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// ===== 搜索管理 =====

// 获取搜索配置
async function handleGetSearchConfigs(_request: Request, env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare(`
      SELECT sc.*, 
        (SELECT COUNT(*) FROM search_engines se WHERE se.config_id = sc.id) as engine_count
      FROM search_configs sc
      ORDER BY sc.sort_order
    `).all();

    // 为每个配置获取引擎列表
    const configsWithEngines = await Promise.all(
      (result.results || []).map(async (config: any) => {
        const engines = await env.DB.prepare(`
          SELECT * FROM search_engines WHERE config_id = ? ORDER BY sort_order
        `).bind(config.id).all();
        return {
          ...config,
          engines: engines.results || []
        };
      })
    );
    
    return jsonResponse({ data: configsWithEngines });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// 获取搜索引擎列表
async function handleGetSearchEngines(_request: Request, env: Env, configId: number): Promise<Response> {
  try {
    const result = await env.DB.prepare(`
      SELECT * FROM search_engines WHERE config_id = ? ORDER BY sort_order
    `).bind(configId).all();
    return jsonResponse({ data: result.results || [] });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// 创建搜索配置
async function handleCreateSearchConfig(request: Request, env: Env): Promise<Response> {
  try {
    const { group_name, sort_order } = await request.json();
    const result = await env.DB.prepare(`
      INSERT INTO search_configs (group_name, sort_order) VALUES (?, ?)
    `).bind(group_name, sort_order || 0).run();
    
    return jsonResponse({ id: result.meta?.last_row_id, message: '创建成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 更新搜索配置
async function handleUpdateSearchConfig(request: Request, env: Env, id: number): Promise<Response> {
  try {
    const { group_name, sort_order } = await request.json();
    await env.DB.prepare(`
      UPDATE search_configs SET group_name = ?, sort_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(group_name, sort_order, id).run();
    
    return jsonResponse({ message: '更新成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 删除搜索配置
async function handleDeleteSearchConfig(_request: Request, env: Env, id: number): Promise<Response> {
  try {
    await env.DB.prepare('DELETE FROM search_configs WHERE id = ?').bind(id).run();
    return jsonResponse({ message: '删除成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 创建搜索引擎
async function handleCreateSearchEngine(request: Request, env: Env): Promise<Response> {
  try {
    const { config_id, engine_id, name, url, placeholder, sort_order } = await request.json();
    const result = await env.DB.prepare(`
      INSERT INTO search_engines (config_id, engine_id, name, url, placeholder, sort_order)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(config_id, engine_id, name, url, placeholder || '', sort_order || 0).run();
    
    return jsonResponse({ id: result.meta?.last_row_id, message: '创建成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 更新搜索引擎
async function handleUpdateSearchEngine(request: Request, env: Env, id: number): Promise<Response> {
  try {
    const { engine_id, name, url, placeholder, sort_order } = await request.json();
    await env.DB.prepare(`
      UPDATE search_engines SET engine_id = ?, name = ?, url = ?, placeholder = ?, sort_order = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(engine_id, name, url, placeholder, sort_order, id).run();
    
    return jsonResponse({ message: '更新成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 删除搜索引擎
async function handleDeleteSearchEngine(_request: Request, env: Env, id: number): Promise<Response> {
  try {
    await env.DB.prepare('DELETE FROM search_engines WHERE id = ?').bind(id).run();
    return jsonResponse({ message: '删除成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// ===== 链接管理 =====

// 获取所有链接
async function handleGetLinks(_request: Request, env: Env): Promise<Response> {
  try {
    const result = await env.DB.prepare(`
      SELECT l.*, g.title as group_title
      FROM links l
      LEFT JOIN groups g ON l.group_id = g.id
      ORDER BY l.sort_order
    `).all();
    return jsonResponse({ data: result.results || [] });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// 创建链接
async function handleCreateLink(request: Request, env: Env): Promise<Response> {
  try {
    const { group_id, title, url, description, sort_order, status } = await request.json();
    const result = await env.DB.prepare(`
      INSERT INTO links (group_id, title, url, description, sort_order, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(group_id, title, url, description || '', sort_order || 0, status ?? 1).run();
    
    return jsonResponse({ id: result.meta?.last_row_id, message: '创建成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 更新链接
async function handleUpdateLink(request: Request, env: Env, id: number): Promise<Response> {
  try {
    const { group_id, title, url, description, sort_order, status } = await request.json();
    await env.DB.prepare(`
      UPDATE links SET group_id = ?, title = ?, url = ?, description = ?, sort_order = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `).bind(group_id, title, url, description, sort_order, status, id).run();
    
    return jsonResponse({ message: '更新成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// 删除链接
async function handleDeleteLink(_request: Request, env: Env, id: number): Promise<Response> {
  try {
    await env.DB.prepare('DELETE FROM links WHERE id = ?').bind(id).run();
    return jsonResponse({ message: '删除成功' });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 400);
  }
}

// ===== 数据导出（用于生成 data.json）=====
async function handleExportData(_request: Request, env: Env): Promise<Response> {
  try {
    // 获取搜索配置
    const searchConfigs = await env.DB.prepare(`
      SELECT sc.* FROM search_configs sc ORDER BY sc.sort_order
    `).all();
    
    // 获取搜索引擎
    const searchEngines = await env.DB.prepare(`
      SELECT * FROM search_engines ORDER BY config_id, sort_order
    `).all();
    
    // 按config_id分组
    const enginesByConfig: Record<number, any[]> = {};
    (searchEngines.results || []).forEach((engine: any) => {
      if (!enginesByConfig[engine.config_id]) enginesByConfig[engine.config_id] = [];
      enginesByConfig[engine.config_id].push({
        id: engine.engine_id,
        name: engine.name,
        url: engine.url,
        placeholder: engine.placeholder
      });
    });
    
    // 构建搜索配置数据
    const pageData: any[] = [{
      id: 'search',
      title: '实用搜索',
      icon: 'ti ti-search',
      searchConfig: (searchConfigs.results || []).map((config: any) => ({
        groupName: config.group_name,
        items: enginesByConfig[config.id] || []
      }))
    }];
    
    // 获取分组
    const groups = await env.DB.prepare(`
      SELECT * FROM groups WHERE parent_id IS NULL ORDER BY sort_order
    `).all();
    
    // 获取子分组
    const childGroups = await env.DB.prepare(`
      SELECT * FROM groups WHERE parent_id IS NOT NULL ORDER BY parent_id, sort_order
    `).all();
    
    // 按parent_id分组
    const groupsByParent: Record<number, any[]> = {};
    (childGroups.results || []).forEach((group: any) => {
      if (!groupsByParent[group.parent_id]) groupsByParent[group.parent_id] = [];
      groupsByParent[group.parent_id].push(group);
    });
    
    // 获取所有链接
    const links = await env.DB.prepare(`
      SELECT * FROM links WHERE status = 1 ORDER BY group_id, sort_order
    `).all();
    
    // 按group_id分组
    const linksByGroup: Record<number, any[]> = {};
    (links.results || []).forEach((link: any) => {
      if (!linksByGroup[link.group_id]) linksByGroup[link.group_id] = [];
      linksByGroup[link.group_id].push({
        title: link.title,
        url: link.url,
        description: link.description
      });
    });
    
    // 构建分组数据
    for (const group of (groups.results || [])) {
      const children = groupsByParent[group.id];
      
      if (children && children.length > 0) {
        // 有子分组
        pageData.push({
          title: group.title,
          icon: group.icon,
          children: children.map((child: any) => ({
            title: child.title,
            items: linksByGroup[child.id] || []
          }))
        });
      } else {
        // 无子分组
        pageData.push({
          title: group.title,
          icon: group.icon,
          items: linksByGroup[group.id] || []
        });
      }
    }
    
    return jsonResponse({ pageData });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// ===== 数据导入（覆盖现有数据）=====
async function handleImportData(request: Request, env: Env): Promise<Response> {
  try {
    const { pageData } = await request.json();
    if (!pageData || !Array.isArray(pageData)) {
      return jsonResponse({ error: '无效的 JSON 数据格式' }, 400);
    }

    // 禁用外键检查并清空数据
    await env.DB.prepare('PRAGMA foreign_keys = OFF').run();
    await env.DB.prepare('DELETE FROM links').run();
    await env.DB.prepare('DELETE FROM groups').run();
    await env.DB.prepare('DELETE FROM search_engines').run();
    await env.DB.prepare('DELETE FROM search_configs').run();
    await env.DB.prepare("DELETE FROM sqlite_sequence WHERE name IN ('links', 'groups', 'search_engines', 'search_configs')").run();

    let importedCount = 0;
    let searchConfigCount = 0;

    // 先处理搜索配置
    const searchItem = pageData.find(item => item.id === 'search');
    if (searchItem && searchItem.searchConfig) {
      for (let i = 0; i < searchItem.searchConfig.length; i++) {
        const config = searchItem.searchConfig[i];
        
        // 插入搜索配置
        const configResult = await env.DB.prepare(`
          INSERT INTO search_configs (group_name, sort_order) VALUES (?, ?)
        `).bind(config.groupName, i).run();
        
        const configId = configResult.meta?.last_row_id;
        searchConfigCount++;

        // 插入搜索引擎
        if (config.items) {
          for (let j = 0; j < config.items.length; j++) {
            const engine = config.items[j];
            await env.DB.prepare(`
              INSERT INTO search_engines (config_id, engine_id, name, url, placeholder, sort_order)
              VALUES (?, ?, ?, ?, ?, ?)
            `).bind(configId, engine.id, engine.name, engine.url, engine.placeholder || '', j).run();
          }
        }
      }
    }

    // 处理分组和链接
    let currentGroupId = 0;
    let topGroupOrder = 0;

    for (const item of pageData) {
      if (item.id === 'search') continue;

      topGroupOrder++;
      currentGroupId++;
      importedCount++;

      const parentGroupId = currentGroupId;

      await env.DB.prepare(`INSERT INTO groups (id, title, icon, sort_order, parent_id) VALUES (?, ?, ?, ?, NULL)`)
        .bind(parentGroupId, item.title, item.icon || 'ti ti-star', topGroupOrder)
        .run();

      if (item.children) {
        for (let i = 0; i < item.children.length; i++) {
          const child = item.children[i];
          currentGroupId++;
          importedCount++;

          await env.DB.prepare(`INSERT INTO groups (id, title, icon, sort_order, parent_id) VALUES (?, ?, ?, ?, ?)`)
            .bind(currentGroupId, child.title, child.icon || item.icon || 'ti ti-star', i + 1, parentGroupId)
            .run();

          if (child.items) {
            for (let j = 0; j < child.items.length; j++) {
              const link = child.items[j];
              await env.DB.prepare(`INSERT INTO links (group_id, title, url, description, sort_order) VALUES (?, ?, ?, ?, ?)`)
                .bind(currentGroupId, link.title, link.url, link.description || '', j)
                .run();
            }
          }
        }
      } else if (item.items) {
        for (let i = 0; i < item.items.length; i++) {
          const link = item.items[i];
          await env.DB.prepare(`INSERT INTO links (group_id, title, url, description, sort_order) VALUES (?, ?, ?, ?, ?)`)
            .bind(parentGroupId, link.title, link.url, link.description || '', i)
            .run();
        }
      }
    }

    await env.DB.prepare('PRAGMA foreign_keys = ON').run();
    return jsonResponse({ 
      message: '导入成功', 
      count: importedCount + searchConfigCount,
      groups: importedCount,
      searchConfigs: searchConfigCount
    });
  } catch (e: any) {
    return jsonResponse({ error: e.message }, 500);
  }
}

// ===== 主路由 =====
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    
    // 处理 OPTIONS 请求（CORS 预检）
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }
    
    // 路由匹配
    try {
      // 登录（不需要认证）
      if (path === '/api/login' && request.method === 'POST') {
        return await handleLogin(request, env);
      }

      // 数据导出 - 公开访问（导航页面需要）
      if (path === '/api/export' && request.method === 'GET') {
        return await handleExportData(request, env);
      }

      // 所有其他 API 需要认证
      const username = await authenticate(request, env);
      if (!username && path.startsWith('/api/')) {
        return jsonResponse({ error: '未授权' }, 401);
      }

      // 概览
      if (path === '/api/overview' && request.method === 'GET') {
        return await handleOverview(request, env);
      }
      
      // 数据导入
      if (path === '/api/import' && request.method === 'POST') {
        return await handleImportData(request, env);
      }
      
      // 分组管理
      if (path === '/api/groups' && request.method === 'GET') {
        return await handleGetGroups(request, env);
      }
      if (path === '/api/groups' && request.method === 'POST') {
        return await handleCreateGroup(request, env);
      }
      
      // 分组详情/更新/删除
      const groupMatch = path.match(/^\/api\/groups\/(\d+)$/);
      if (groupMatch) {
        const id = parseInt(groupMatch[1]);
        if (request.method === 'PUT') return await handleUpdateGroup(request, env, id);
        if (request.method === 'DELETE') return await handleDeleteGroup(request, env, id);
      }
      
      // 搜索配置
      if (path === '/api/search-configs' && request.method === 'GET') {
        return await handleGetSearchConfigs(request, env);
      }
      if (path === '/api/search-configs' && request.method === 'POST') {
        return await handleCreateSearchConfig(request, env);
      }
      
      // 搜索配置详情/更新/删除
      const configMatch = path.match(/^\/api\/search-configs\/(\d+)$/);
      if (configMatch) {
        const id = parseInt(configMatch[1]);
        if (request.method === 'PUT') return await handleUpdateSearchConfig(request, env, id);
        if (request.method === 'DELETE') return await handleDeleteSearchConfig(request, env, id);
      }
      
      // 搜索引擎
      if (path === '/api/search-engines' && request.method === 'POST') {
        return await handleCreateSearchEngine(request, env);
      }
      
      const engineMatch = path.match(/^\/api\/search-configs\/(\d+)\/engines$/);
      if (engineMatch && request.method === 'GET') {
        return await handleGetSearchEngines(request, env, parseInt(engineMatch[1]));
      }
      
      const engineDetailMatch = path.match(/^\/api\/search-engines\/(\d+)$/);
      if (engineDetailMatch) {
        const id = parseInt(engineDetailMatch[1]);
        if (request.method === 'PUT') return await handleUpdateSearchEngine(request, env, id);
        if (request.method === 'DELETE') return await handleDeleteSearchEngine(request, env, id);
      }
      
      // 链接管理
      if (path === '/api/links' && request.method === 'GET') {
        return await handleGetLinks(request, env);
      }
      if (path === '/api/links' && request.method === 'POST') {
        return await handleCreateLink(request, env);
      }
      
      const linkMatch = path.match(/^\/api\/links\/(\d+)$/);
      if (linkMatch) {
        const id = parseInt(linkMatch[1]);
        if (request.method === 'PUT') return await handleUpdateLink(request, env, id);
        if (request.method === 'DELETE') return await handleDeleteLink(request, env, id);
      }
      
      // 未找到路由
      return jsonResponse({ error: 'Not Found' }, 404);
    } catch (e: any) {
      return jsonResponse({ error: e.message }, 500);
    }
  }
};
