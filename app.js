import express from 'express';
import fetch from 'node-fetch';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));

// Головна сторінка
app.get('/', (req, res) => {
  res.render('index');
});

// Показати список репозиторіїв
app.post('/repos', async (req, res) => {
  const username = req.body.username;

  const response = await fetch(`https://api.github.com/users/${username}/repos`);
  const repos = await response.json();

  if (!Array.isArray(repos)) {
    return res.send('Користувача не знайдено або GitHub API заблокував запит.');
  }

  res.render('repos', { username, repos });
});

// Показати деталі репозиторію
app.get('/repo/:username/:repo', async (req, res) => {
  const { username, repo } = req.params;

  try {
    const [repoInfo, commits, languages] = await Promise.all([
      fetch(`https://api.github.com/repos/${username}/${repo}`).then(res => res.json()),
      fetch(`https://api.github.com/repos/${username}/${repo}/commits`).then(res => res.json()),
      fetch(`https://api.github.com/repos/${username}/${repo}/languages`).then(res => res.json()),
    ]);

    res.render('repo-details', {
      repoInfo,
      commits: commits.slice(0, 10),
      languages: Object.keys(languages),
    });
  } catch (error) {
    res.send('Помилка при завантаженні даних про репозиторій.');
  }
});

const port = 3000;
app.listen(port, () => {
  console.log(`Сервер працює на http://localhost:${port}`);
});
