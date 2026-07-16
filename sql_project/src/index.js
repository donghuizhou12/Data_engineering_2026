// import express from 'express';

// const app = express();

// app.get('/', (req, res) => {
//   res.send('Hello from Docker + Node!');
// });

// app.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on port 3000');
// });

// app.get('/form', (req, res) => {
//   res.send(`
//     <form method="POST" action="/submit">
//       <input name="text" placeholder="输入一些内容" />
//       <button type="submit">保存</button>
//     </form>
//   `);
// });

// import express from 'express';

// const app = express();

// // ⭐ 必须加在这里：让 Express 能解析 POST 表单
// app.use(express.urlencoded({ extended: true }));

// app.get('/', (req, res) => {
//   res.send('Hello from Docker + Node!');
// });

// app.get('/form', (req, res) => {
//   res.send(`
//     <form method="POST" action="/submit">
//       <input name="text" placeholder="输入一些内容" />
//       <button type="submit">保存</button>
//     </form>
//   `);
// });

// // ⭐ 以后你要写 /submit 路由时，这里才能读到 req.body.text
// // app.post('/submit', (req, res) => {
// //   console.log(req.body.text);
// // });

// app.listen(3000, '0.0.0.0', () => {
//   console.log('Server running on port 3000');
// });
import express from 'express';
import mysql from 'mysql2/promise';
import waitPort from 'wait-port';

const app = express();
app.use(express.urlencoded({ extended: true }));

let db;

// ⭐ 等待 MySQL 容器准备好
async function initDatabase() {
  console.log('Waiting for MySQL to be ready...');

  await waitPort({ host: 'mysql', port: 3306 });

  db = await mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: 'secret',
    database: 'todos'
  });

  console.log('MySQL connected!');
}

// ⭐ 初始化数据库（不会阻塞 Express）
initDatabase().catch(err => {
  console.error('Database init failed:', err);
});

// 首页
app.get('/', (req, res) => {
  res.send('Hello from Docker + Node!');
});

// 输入表单
app.get('/form', (req, res) => {
  res.send(`
    <form method="POST" action="/submit">
      <input name="text" placeholder="输入一些内容" />
      <button type="submit">保存</button>
    </form>
  `);
});

// 保存到 MySQL
app.post('/submit', async (req, res) => {
  if (!db) return res.send('数据库还没准备好，请稍等再试');

  const { text } = req.body;
  await db.execute('INSERT INTO messages (text) VALUES (?)', [text]);
  res.send('保存成功！');
});

// 显示所有数据
app.get('/list', async (req, res) => {
  if (!db) return res.send('数据库还没准备好，请稍等再试');

  const [rows] = await db.execute('SELECT * FROM messages');
  res.json(rows);
});

// 启动服务
app.listen(3000, '0.0.0.0', () => {
  console.log('Server running on port 3000');
});
