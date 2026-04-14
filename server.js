const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// 静态资源目录
app.use(express.static(path.join(__dirname, 'public')));

// 404 页面
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✅ 服务器已启动:`);
    console.log(`   本地访问: http://localhost:${PORT}`);
    console.log(`   按 Ctrl+C 停止服务器\n`);
});
