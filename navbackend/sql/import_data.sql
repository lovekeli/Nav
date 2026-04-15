-- 数据导入脚本 - 简化版
-- 将 data.json 数据导入到数据库

-- 禁用外键检查
PRAGMA foreign_keys = OFF;

-- 清空现有数据
DELETE FROM links;
DELETE FROM groups;
DELETE FROM search_engines;
DELETE FROM search_configs;

-- ===== 搜索配置 =====
INSERT INTO search_configs (group_name, sort_order) VALUES ('搜索', 1);
INSERT INTO search_configs (group_name, sort_order) VALUES ('工具', 2);
INSERT INTO search_configs (group_name, sort_order) VALUES ('社区', 3);
INSERT INTO search_configs (group_name, sort_order) VALUES ('生活', 4);
INSERT INTO search_configs (group_name, sort_order) VALUES ('求职', 5);

-- ===== 分组 =====
-- 顶级分组
INSERT INTO groups (title, icon, sort_order) VALUES ('AI团体', 'ti ti-flame', 1);
INSERT INTO groups (title, icon, sort_order) VALUES ('热搜新闻', 'ti ti-news', 2);
INSERT INTO groups (title, icon, sort_order) VALUES ('常用推荐', 'ti ti-star', 3);
INSERT INTO groups (title, icon, sort_order) VALUES ('及时行乐', 'ti ti-disc', 4);

-- 带子分组的顶级分组
INSERT INTO groups (title, icon, sort_order) VALUES ('素材资源', 'ti ti-book', 5);
INSERT INTO groups (title, icon, sort_order) VALUES ('开发生产', 'ti ti-database', 6);
INSERT INTO groups (title, icon, sort_order) VALUES ('系统相关', 'ti ti-device-desktop', 7);
INSERT INTO groups (title, icon, sort_order) VALUES ('学无止境', 'ti ti-school', 8);
INSERT INTO groups (title, icon, sort_order) VALUES ('社区资讯', 'ti ti-news', 9);

-- 子分组（素材资源 parent_id=5）
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('壁纸下载', 'ti ti-book', 1, 5);
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('PNG免扣', 'ti ti-book', 2, 5);
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('PPT资源', 'ti ti-book', 3, 5);
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('字体资源', 'ti ti-book', 4, 5);

-- 子分组（开发生产 parent_id=6）
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('域名申请', 'ti ti-book', 1, 6);
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('云端服务', 'ti ti-book', 2, 6);
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('开发文档', 'ti ti-book', 3, 6);

-- 子分组（系统相关 parent_id=7）
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('系统下载', 'ti ti-book', 1, 7);
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('系统美化', 'ti ti-book', 2, 7);
INSERT INTO groups (title, icon, sort_order, parent_id) VALUES ('系统工具', 'ti ti-book', 3, 7);

-- ===== AI团体 链接 (group_id=1) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (1, 'ChatGPT', 'https://chatgpt.com/', 'ChatGPT 是由 OpenAI 开发的一种人工智能语言模型'),
  (1, 'DeepSeek', 'https://www.deepseek.com/', 'DeepSeek 深度求索 探索未至之境'),
  (1, 'Gemini', 'https://gemini.google.com/', 'Gemini Pro 谷歌高性能AI模型'),
  (1, 'Grok 3', 'https://x.com/i/grok/', '马斯克旗下xAI团队研发的第三代大语言模型'),
  (1, '文心一言', 'https://yiyan.baidu.com/', '百度研发的知识增强大语言模型'),
  (1, '通义千问', 'https://www.tongyi.com/', '阿里巴巴推出的AI预训练模型'),
  (1, '智谱清言', 'https://chatglm.cn/', '智谱AI开发的中英双语对话模型'),
  (1, '豆包', 'https://www.doubao.com/chat/', '字节跳动精心打造的AI助手'),
  (1, '天工AI', 'https://www.tiangong.cn/', '支持搜索写作对话的全能型AI助手'),
  (1, 'Google AI Studio', 'https://aistudio.google.com/', '基于浏览器的轻量级AI平台');

-- ===== 热搜新闻 链接 (group_id=2) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (2, '多媒体数字报纸', 'http://www.53bk.com/baokan/', '国内报纸电子版大全'),
  (2, '今日热榜', 'https://tophub.today/', '今日热榜提供各站热榜聚合'),
  (2, '果汁排行榜', 'http://www.guozhivip.com/rank/', '一键式快速查询各类排行榜'),
  (2, 'NEWS', 'https://news.3301.qzz.io/', '优雅地阅读实时热门新闻');

-- ===== 常用推荐 链接 (group_id=3) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (3, 'Youtube', 'https://www.youtube.com/', '全球最大的视频分享平台'),
  (3, '哔哩哔哩', 'https://bilibili.com/', '中国版youtube'),
  (3, 'GitHub', 'https://github.com/', '管理软件开发以及发现已有代码的首选方法');

-- ===== 及时行乐 链接 (group_id=4) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (4, '网易云音乐', 'https://music.163.com/', '网易云音乐'),
  (4, 'QQ音乐', 'https://y.qq.com/', 'QQ音乐'),
  (4, '酷狗音乐', 'https://www.kugou.com/', '酷狗音乐'),
  (4, 'Spotify', 'https://open.spotify.com/', '全球最大的流媒体音乐服务');

-- ===== 壁纸下载 链接 (group_id=10) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (10, 'Awesome Wallpapers', 'https://wallhaven.cc/', '高清壁纸站'),
  (10, 'Wallpaper Abyss', 'https://wall.alphacoders.com/', '一家壁纸社区'),
  (10, '二次元壁纸', 'https://konachan.net/', '免费二次元壁纸下载'),
  (10, 'P站', 'https://www.pixiv.net/', '提供插画等作品的投稿、阅览服务'),
  (10, 'Unsplash', 'https://unsplash.com/', '摄影壁纸分享'),
  (10, '星空壁纸', 'https://www.eso.org/public/images/', '关于宇宙星空的壁纸站'),
  (10, 'pixabay', 'https://pixabay.com/zh/', '免费正版高清图片素材库');

-- ===== PNG免扣 链接 (group_id=11) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (11, '觅元素', 'http://www.51yuansu.com/', '下载免抠素材,透明背景素材'),
  (11, '菜鸟图库', 'http://www.sucai999.com/', '专注于为广大设计师提供免费的素材模版'),
  (11, '图精灵', 'http://616pic.com/', '免费PNG图片下载'),
  (11, '在线一键抠图', 'https://pixian.ai/', '上传即可实现一键抠图');

-- ===== 域名申请 链接 (group_id=13) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (13, 'spaceship', 'https://www.spaceship.com/', '国外域名申请网站，支持支付宝付款'),
  (13, 'namecheap', 'https://www.namecheap.com/', '国外域名申请网站'),
  (13, '西部数码', 'https://www.west.cn/', '云服务器-虚拟主机-域名注册'),
  (13, '新网', 'https://www.xinnet.com/', '互联网基础应用服务提供商');

-- ===== 云端服务 链接 (group_id=14) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (14, '腾讯云', 'https://cloud.tencent.com/', '腾讯云 - 产业智变 云启未来'),
  (14, '阿里云', 'https://www.aliyun.com/', '阿里云-上云就上阿里云'),
  (14, '又拍云', 'https://www.upyun.com/', '静态文件存储与CDN加速'),
  (14, 'LeanCloud', 'https://www.leancloud.cn/', '云存储, 一站式后端服务'),
  (14, 'npm', 'https://www.npmjs.com/', 'npm是世界上最大的软件注册表'),
  (14, 'Vercel', 'https://vercel.com/', '类似Github Pages免费托管项目'),
  (14, 'netlify', 'https://www.netlify.com/', '类似Github Pages免费托管项目');

-- ===== 开发文档 链接 (group_id=15) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (15, 'Valine', 'https://valine.js.org/', '一款快速、简洁且高效的无后端评论系统'),
  (15, 'DPlayer', 'https://dplayer.diygod.dev/', '网站视频播放插件'),
  (15, 'Gitee', 'https://gitee.com/', 'Gitee 是一个云端软件开发协作平台'),
  (15, 'GitCode', 'https://gitcode.com/', '全球开发者的开源社区');

-- ===== 系统下载 链接 (group_id=16) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (16, '我告诉你msdn', 'https://msdn.itellyou.cn/', '系统下载'),
  (16, '系统下载', 'https://tb.rg-adguard.net/public.php', '无需下载器直接下载系统'),
  (16, 'MSDN - 山己几子木', 'https://msdn.sjjzm.com/', '系统下载');

-- ===== 系统美化 链接 (group_id=17) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (17, '致美化', 'https://zhutix.com/', '致美化是国内最专业的桌面美化研究平台'),
  (17, 'Fliqlo', 'https://fliqlo.com/', '桌面时钟屏保'),
  (17, '主题之家', 'https://zhuti.ithome.com/', '主题美化下载');

-- ===== 系统工具 链接 (group_id=18) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (18, '桌面显卡性能天梯图', 'https://www.mydrivers.com/zhuanti/tianti/gpu/', '桌面显卡性能天梯图'),
  (18, '桌面CPU性能天梯图', 'https://www.mydrivers.com/zhuanti/tianti/cpu/', '桌面CPU性能天梯图'),
  (18, 'IT天空', 'https://www.itsk.com/', '以系统封装技术与驱动技术为主的综合性IT站点');

-- ===== 学无止境 链接 (group_id=8) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (8, '廖雪峰的官方网站', 'https://www.liaoxuefeng.com/', '自学编程大牛站'),
  (8, 'Python - 100天', 'https://github.com/jackfrued/Python-100-Days', '自学编程案例'),
  (8, '大学资源网', 'http://www.dxzy163.com/', '大学课程、中学课程、小学课程'),
  (8, '我要自学网', 'https://www.51zxw.net/', '免费视频教程,提供全方位软件学习'),
  (8, '批处理之家', 'http://www.bathome.net/', '批处理论坛'),
  (8, '学语言', 'https://www.memrise.com/', '自学各国语言'),
  (8, '读典籍', 'https://web.dudianji.com/', '文白对照读典籍');

-- ===== 社区资讯 链接 (group_id=9) =====
INSERT INTO links (group_id, title, url, description) VALUES
  (9, '吾爱破解', 'https://www.52pojie.cn/', '致力于软件安全与病毒分析的前沿'),
  (9, 'IT之家', 'https://www.ithome.com/', '百度指数排名第一的前沿科技门户网站'),
  (9, '蓝点网', 'https://www.landiannews.com/', '给你感兴趣的内容'),
  (9, 'N软', 'https://www.nruan.com/', '科技让生活更美好'),
  (9, '雷锋网', 'https://www.leiphone.com/', '人工智能和智能硬件领域的互联网科技媒体'),
  (9, '36kr', 'http://36kr.com/', '创业资讯、科技新闻'),
  (9, '数英网', 'https://www.digitaling.com/', '数字媒体及职业招聘网站'),
  (9, '人人都是产品经理', 'http://www.woshipm.com/', '产品经理学习交流平台'),
  (9, '鸟哥笔记', 'http://www.niaogebiji.com/', '移动互联网第一干货平台'),
  (9, '豆瓣', 'https://www.douban.com/', '影音社区'),
  (9, '少数派', 'https://sspai.com/', '高品质数字消费指南'),
  (9, '爱范儿', 'https://www.ifanr.com/', '让未来触手可及');

-- 恢复外键检查
PRAGMA foreign_keys = ON;
