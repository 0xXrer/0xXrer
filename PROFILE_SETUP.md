# GitHub Profile README Setup Guide

This document explains the enhanced GitHub profile README and its features.

## Features Implemented

### 1. **Header Section** ✅
- Welcome message with username
- Brief introduction with emojis
- Current status/working on section
- Social media links (Discord, Telegram)

### 2. **Technology Stack** ✅
- Organized by categories:
  - Core Languages (C, C++, Rust, Assembly)
  - Web Technologies (TypeScript, JavaScript, Node.js, React)
  - Scripting & Automation (Python, Lua, Bash)
  - Tools & Platforms (Git, GitHub, Linux, VS Code, Docker)
- Badges from shields.io with consistent styling

### 3. **GitHub Statistics** ✅
- **GitHub Stats Card**: Shows stars, commits, PRs, issues, and repositories
- **Streak Stats**: Displays contribution streaks with custom theming
- **Most Used Languages**: 
  - Compact layout showing top languages
  - Donut chart visualization
- **Contribution Activity Graph**: Activity graph with language breakdown
- **GitHub Profile Trophy**: Achievement trophies
- **3D Contribution Graph**: Isometric view (generated via GitHub Actions)

### 4. **Current Projects & Focus** ✅
- Active projects list with emojis
- Learning goals
- Philosophy statement
- Areas of expertise with visual progress bars

### 5. **Connect Section** ✅
- Social media badges (Discord, Telegram, GitHub)
- Call to action for collaboration
- Profile view counter
- Animated footer with waving graphic

## Dynamic Content

All statistics and graphs update automatically:

1. **GitHub Stats**: Updates in real-time via `github-readme-stats.vercel.app`
2. **Streak Stats**: Updates daily via `github-readme-streak-stats.herokuapp.com`
3. **Activity Graph**: Updates via `github-readme-activity-graph.vercel.app`
4. **Trophy**: Updates via `github-profile-trophy.vercel.app`
5. **3D Contribution Graph**: Generated daily at midnight UTC via GitHub Actions

## Theme

- **Color Scheme**: Dark theme (#0d1117 background)
- **Accent Color**: Purple (#9b59b6)
- **Style**: Minimalist with consistent spacing and alignment
- **Borders**: Hidden for a cleaner look

## GitHub Actions Workflow

The repository includes a workflow (`.github/workflows/profile-3d.yml`) that:
- Runs daily at midnight UTC
- Can be triggered manually
- Generates the 3D contribution graph
- Commits the result to the repository

### First-Time Setup

After merging this PR, the 3D contribution graph will be generated on the first workflow run. You can:
1. Wait for the scheduled run (midnight UTC)
2. Manually trigger from Actions tab: `GitHub Profile 3D Contribution` → `Run workflow`
3. Push to main branch to trigger automatically

## Customization

### Colors
To change the accent color, replace `9b59b6` in the URLs with your preferred hex color (without #).

### Stats Display
Modify the URL parameters in the README:
- `show_icons=true/false` - Show/hide icons
- `include_all_commits=true/false` - Include all commits or only current year
- `count_private=true/false` - Count private contributions
- `layout=compact/donut` - Change layout style
- `langs_count=8` - Number of languages to display

### Social Links
Update the badge URLs with your own profile links:
- Discord: Replace user ID in the URL
- Telegram: Replace username
- Add more platforms as needed

## File Structure

```
.
├── .github/
│   └── workflows/
│       └── profile-3d.yml          # 3D graph generation workflow
├── profile-3d-contrib/
│   ├── README.md                    # 3D graph directory info
│   └── profile-night-rainbow.svg    # Generated 3D graph (after first run)
├── assets/                          # Additional assets
├── Group 8-3.png                    # Banner image
├── README.md                        # Main profile README
└── PROFILE_SETUP.md                # This file
```

## Troubleshooting

### 3D Graph Not Showing
- Check if the GitHub Actions workflow has run successfully
- Verify the workflow has write permissions
- Manually trigger the workflow from Actions tab

### Stats Not Loading
- Verify the username is correct in all URLs
- Check if the external services are operational
- Try accessing the URLs directly in a browser

### Badges Not Rendering
- Ensure URLs are properly encoded (spaces as %20, etc.)
- Check shields.io service status
- Verify badge syntax is correct

## Credits

Services used:
- [github-readme-stats](https://github.com/anuraghazra/github-readme-stats)
- [github-readme-streak-stats](https://github.com/DenverCoder1/github-readme-streak-stats)
- [github-readme-activity-graph](https://github.com/Ashutosh00710/github-readme-activity-graph)
- [github-profile-trophy](https://github.com/ryo-ma/github-profile-trophy)
- [github-profile-3d-contrib](https://github.com/yoshi389111/github-profile-3d-contrib)
- [shields.io](https://shields.io) for badges
- [capsule-render](https://github.com/kyechan99/capsule-render) for animated header/footer

## Maintenance

The profile is designed to be self-maintaining:
- Statistics update automatically
- 3D graph regenerates daily
- No manual updates required unless changing content/structure

Enjoy your enhanced GitHub profile! 🚀
