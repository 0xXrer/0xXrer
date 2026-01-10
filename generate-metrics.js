const https = require('https');
const fs = require('fs');

const USERNAME = '0xXrer';
const TOKEN = process.env.GITHUB_TOKEN || process.argv[2];

if (!TOKEN) {
  console.error('Usage: node generate-metrics.js <GITHUB_TOKEN>');
  console.error('Or set GITHUB_TOKEN environment variable');
  process.exit(1);
}

function fetchGitHub(query) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const options = {
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'User-Agent': 'metrics-generator',
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve(JSON.parse(body)));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function getUserData() {
  const query = `
    query {
      user(login: "${USERNAME}") {
        name
        login
        bio
        avatarUrl
        followers { totalCount }
        following { totalCount }
        repositories(first: 100, ownerAffiliations: OWNER, privacy: PUBLIC) {
          totalCount
          nodes {
            name
            stargazerCount
            forkCount
            primaryLanguage { name color }
          }
        }
        contributionsCollection {
          totalCommitContributions
          totalPullRequestContributions
          totalIssueContributions
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `;
  return fetchGitHub(query);
}

function generateClassicSVG(user) {
  const repos = user.repositories.nodes;
  const stars = repos.reduce((sum, r) => sum + r.stargazerCount, 0);
  const forks = repos.reduce((sum, r) => sum + r.forkCount, 0);
  const commits = user.contributionsCollection.totalCommitContributions;
  const prs = user.contributionsCollection.totalPullRequestContributions;
  const issues = user.contributionsCollection.totalIssueContributions;
  const contributions = user.contributionsCollection.contributionCalendar.totalContributions;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="280" viewBox="0 0 480 280">
  <style>
    .bg { fill: #0d1117; }
    .title { fill: #9b59b6; font: bold 18px 'Segoe UI', Ubuntu, Sans-Serif; }
    .stat-label { fill: #8b949e; font: 14px 'Segoe UI', Ubuntu, Sans-Serif; }
    .stat-value { fill: #c9d1d9; font: bold 14px 'Segoe UI', Ubuntu, Sans-Serif; }
    .icon { fill: #9b59b6; }
  </style>
  <rect class="bg" width="100%" height="100%" rx="10"/>
  <text x="25" y="35" class="title">${user.login}'s GitHub Stats</text>
  
  <g transform="translate(25, 60)">
    <text class="stat-label" y="0">⭐ Total Stars:</text>
    <text class="stat-value" x="200" y="0">${stars}</text>
    
    <text class="stat-label" y="30">📝 Total Commits (${new Date().getFullYear()}):</text>
    <text class="stat-value" x="200" y="30">${commits}</text>
    
    <text class="stat-label" y="60">🔀 Total PRs:</text>
    <text class="stat-value" x="200" y="60">${prs}</text>
    
    <text class="stat-label" y="90">❗ Total Issues:</text>
    <text class="stat-value" x="200" y="90">${issues}</text>
    
    <text class="stat-label" y="120">🍴 Total Forks:</text>
    <text class="stat-value" x="200" y="120">${forks}</text>
    
    <text class="stat-label" y="150">📦 Repositories:</text>
    <text class="stat-value" x="200" y="150">${user.repositories.totalCount}</text>
    
    <text class="stat-label" y="180">🔥 Contributions:</text>
    <text class="stat-value" x="200" y="180">${contributions}</text>
  </g>
  
  <text x="25" y="265" class="stat-label" style="font-size: 11px;">👥 ${user.followers.totalCount} followers · ${user.following.totalCount} following</text>
</svg>`;
}

function generateLanguagesSVG(user) {
  const langMap = {};
  user.repositories.nodes.forEach(repo => {
    if (repo.primaryLanguage) {
      const name = repo.primaryLanguage.name;
      langMap[name] = langMap[name] || { count: 0, color: repo.primaryLanguage.color || '#8b949e' };
      langMap[name].count++;
    }
  });

  const sorted = Object.entries(langMap)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 8);
  
  const total = sorted.reduce((sum, [_, v]) => sum + v.count, 0);
  
  let bars = '';
  let legend = '';
  let x = 25;
  
  sorted.forEach(([name, data], i) => {
    const pct = (data.count / total * 100).toFixed(1);
    const width = (data.count / total) * 430;
    bars += `<rect x="${x}" y="50" width="${width}" height="10" fill="${data.color}" rx="2"/>`;
    x += width;
    
    const col = i % 2;
    const row = Math.floor(i / 2);
    legend += `
      <g transform="translate(${25 + col * 215}, ${80 + row * 25})">
        <circle r="5" cx="5" cy="10" fill="${data.color}"/>
        <text x="15" y="14" class="stat-label">${name} ${pct}%</text>
      </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="200" viewBox="0 0 480 200">
  <style>
    .bg { fill: #0d1117; }
    .title { fill: #9b59b6; font: bold 16px 'Segoe UI', Ubuntu, Sans-Serif; }
    .stat-label { fill: #c9d1d9; font: 12px 'Segoe UI', Ubuntu, Sans-Serif; }
  </style>
  <rect class="bg" width="100%" height="100%" rx="10"/>
  <text x="25" y="30" class="title">Most Used Languages</text>
  ${bars}
  ${legend}
</svg>`;
}

function generateCalendarSVG(user) {
  const weeks = user.contributionsCollection.contributionCalendar.weeks.slice(-52);
  const cellSize = 8;
  const gap = 2;
  
  let cells = '';
  weeks.forEach((week, weekIdx) => {
    week.contributionDays.forEach((day, dayIdx) => {
      const count = day.contributionCount;
      let color = '#161b22';
      if (count > 0) color = '#0e4429';
      if (count >= 3) color = '#006d32';
      if (count >= 6) color = '#26a641';
      if (count >= 10) color = '#39d353';
      
      cells += `<rect x="${weekIdx * (cellSize + gap)}" y="${dayIdx * (cellSize + gap)}" width="${cellSize}" height="${cellSize}" fill="${color}" rx="2"/>`;
    });
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="560" height="120" viewBox="0 0 560 120">
  <style>
    .bg { fill: #0d1117; }
    .title { fill: #9b59b6; font: bold 14px 'Segoe UI', Ubuntu, Sans-Serif; }
    .stat-label { fill: #8b949e; font: 10px 'Segoe UI', Ubuntu, Sans-Serif; }
  </style>
  <rect class="bg" width="100%" height="100%" rx="10"/>
  <text x="15" y="20" class="title">Contribution Calendar (${user.contributionsCollection.contributionCalendar.totalContributions} contributions)</text>
  <g transform="translate(15, 35)">
    ${cells}
  </g>
  <g transform="translate(460, 105)">
    <text class="stat-label">Less</text>
    <rect x="30" y="-7" width="8" height="8" fill="#161b22" rx="1"/>
    <rect x="40" y="-7" width="8" height="8" fill="#0e4429" rx="1"/>
    <rect x="50" y="-7" width="8" height="8" fill="#006d32" rx="1"/>
    <rect x="60" y="-7" width="8" height="8" fill="#26a641" rx="1"/>
    <rect x="70" y="-7" width="8" height="8" fill="#39d353" rx="1"/>
    <text class="stat-label" x="82">More</text>
  </g>
</svg>`;
}

function generateStarsSVG(user) {
  const starred = user.repositories.nodes
    .filter(r => r.stargazerCount > 0)
    .sort((a, b) => b.stargazerCount - a.stargazerCount)
    .slice(0, 3);

  let items = '';
  starred.forEach((repo, i) => {
    items += `
      <g transform="translate(25, ${50 + i * 40})">
        <text class="repo-name">📁 ${repo.name}</text>
        <text class="stat-label" x="0" y="18">⭐ ${repo.stargazerCount} stars · 🍴 ${repo.forkCount} forks</text>
      </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="180" viewBox="0 0 400 180">
  <style>
    .bg { fill: #0d1117; }
    .title { fill: #9b59b6; font: bold 16px 'Segoe UI', Ubuntu, Sans-Serif; }
    .repo-name { fill: #c9d1d9; font: bold 13px 'Segoe UI', Ubuntu, Sans-Serif; }
    .stat-label { fill: #8b949e; font: 11px 'Segoe UI', Ubuntu, Sans-Serif; }
  </style>
  <rect class="bg" width="100%" height="100%" rx="10"/>
  <text x="25" y="30" class="title">⭐ Top Starred Repositories</text>
  ${items.length ? items : '<text x="25" y="80" class="stat-label">No starred repositories yet</text>'}
</svg>`;
}

function generateAchievementsSVG(user) {
  const achievements = [];
  const repos = user.repositories.totalCount;
  const commits = user.contributionsCollection.totalCommitContributions;
  const stars = user.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0);
  const followers = user.followers.totalCount;

  if (repos >= 1) achievements.push({ icon: '📦', name: 'First Repo', desc: 'Created first repository' });
  if (repos >= 10) achievements.push({ icon: '🗃️', name: 'Collector', desc: '10+ repositories' });
  if (commits >= 100) achievements.push({ icon: '💻', name: 'Committer', desc: '100+ commits' });
  if (commits >= 500) achievements.push({ icon: '🔥', name: 'On Fire', desc: '500+ commits' });
  if (stars >= 10) achievements.push({ icon: '⭐', name: 'Star Gazer', desc: '10+ stars earned' });
  if (followers >= 10) achievements.push({ icon: '👥', name: 'Popular', desc: '10+ followers' });
  if (user.contributionsCollection.totalPullRequestContributions >= 5) achievements.push({ icon: '🔀', name: 'Pull Shark', desc: '5+ PRs merged' });

  let items = '';
  achievements.slice(0, 6).forEach((a, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    items += `
      <g transform="translate(${25 + col * 145}, ${50 + row * 55})">
        <rect width="135" height="45" fill="#161b22" rx="8"/>
        <text x="12" y="22" style="font-size: 16px">${a.icon}</text>
        <text x="35" y="20" class="ach-name">${a.name}</text>
        <text x="35" y="34" class="ach-desc">${a.desc}</text>
      </g>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="170" viewBox="0 0 480 170">
  <style>
    .bg { fill: #0d1117; }
    .title { fill: #9b59b6; font: bold 16px 'Segoe UI', Ubuntu, Sans-Serif; }
    .ach-name { fill: #c9d1d9; font: bold 11px 'Segoe UI', Ubuntu, Sans-Serif; }
    .ach-desc { fill: #8b949e; font: 9px 'Segoe UI', Ubuntu, Sans-Serif; }
  </style>
  <rect class="bg" width="100%" height="100%" rx="10"/>
  <text x="25" y="30" class="title">🏆 Achievements</text>
  ${items.length ? items : '<text x="25" y="80" class="ach-desc">Keep contributing to unlock achievements!</text>'}
</svg>`;
}

async function main() {
  console.log('🔄 Fetching GitHub data...');
  
  try {
    const result = await getUserData();
    
    if (result.errors) {
      console.error('GitHub API Error:', result.errors[0].message);
      process.exit(1);
    }

    const user = result.data.user;
    console.log(`✅ Found user: ${user.login}`);

    console.log('📊 Generating metrics.classic.svg...');
    fs.writeFileSync('metrics.classic.svg', generateClassicSVG(user));

    console.log('🎨 Generating metrics.plugin.languages.svg...');
    fs.writeFileSync('metrics.plugin.languages.svg', generateLanguagesSVG(user));

    console.log('📅 Generating metrics.plugin.isocalendar.fullyear.svg...');
    fs.writeFileSync('metrics.plugin.isocalendar.fullyear.svg', generateCalendarSVG(user));

    console.log('⭐ Generating metrics.plugin.stars.svg...');
    fs.writeFileSync('metrics.plugin.stars.svg', generateStarsSVG(user));

    console.log('🏆 Generating metrics.plugin.achievements.svg...');
    fs.writeFileSync('metrics.plugin.achievements.svg', generateAchievementsSVG(user));

    console.log('\n✨ Done! Generated 5 SVG files.');
    console.log('Run: git add *.svg && git commit -m "Add metrics" && git push');
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

main();
