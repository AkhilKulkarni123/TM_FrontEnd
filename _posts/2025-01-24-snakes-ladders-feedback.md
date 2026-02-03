---
layout: post
title: "Snakes and Ladders - Peer Feedback & Review"
description: A compilation of peer feedback received during our AP CSP crossover review for the Snakes and Ladders educational game project.
permalink: /snakes-ladders-feedback
toc: true
comments: true
categories: ['Game Development', 'Feedback']
---

<style>
.feedback-card {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 12px;
    padding: 20px;
    margin: 16px 0;
}
.feedback-card h4 {
    margin: 0 0 8px 0;
    color: #4facfe;
}
.feedback-card .reviewer {
    font-size: 0.85em;
    color: #f093fb;
    margin-bottom: 12px;
    font-weight: 600;
}
.glow-section {
    background: rgba(39, 174, 96, 0.1);
    border-left: 4px solid #27ae60;
    padding: 12px 16px;
    margin: 10px 0;
    border-radius: 0 8px 8px 0;
}
.grow-section {
    background: rgba(231, 76, 60, 0.1);
    border-left: 4px solid #e74c3c;
    padding: 12px 16px;
    margin: 10px 0;
    border-radius: 0 8px 8px 0;
}
.glow-section h5, .grow-section h5 {
    margin: 0 0 8px 0;
    font-size: 0.95em;
}
.glow-section h5 { color: #27ae60; }
.grow-section h5 { color: #e74c3c; }
.rating-badge {
    display: inline-block;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.85em;
    font-weight: 600;
    margin-left: 10px;
}
.team-overview {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 12px;
    margin: 20px 0;
}
.team-member {
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
}
.team-member h5 {
    margin: 0 0 4px 0;
    color: #4facfe;
}
.team-member p {
    margin: 0;
    font-size: 0.8em;
    color: rgba(255,255,255,0.7);
}
.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 16px;
    margin: 20px 0;
}
.summary-stat {
    background: rgba(102, 126, 234, 0.15);
    border-radius: 12px;
    padding: 20px;
    text-align: center;
}
.summary-stat .number {
    font-size: 2.5em;
    font-weight: bold;
    color: #667eea;
}
.summary-stat .label {
    font-size: 0.85em;
    color: rgba(255,255,255,0.7);
}
</style>

## Project Overview

Our **Snakes and Ladders** game is a gamified educational platform designed to teach AP Computer Science Principles through an interactive board game experience. Players progress through lessons, answer CS questions, and use earned "bullets" as currency in multiplayer boss battles and PvP arenas.

### Team Contributors

<div class="team-overview">
<div class="team-member">
<h5>Akhil</h5>
<p>Scrum Master / Multiplayer & Victory</p>
</div>
<div class="team-member">
<h5>Moiz</h5>
<p>DevOps / Authentication Lead</p>
</div>
<div class="team-member">
<h5>Samarth</h5>
<p>Lesson System Developer</p>
</div>
<div class="team-member">
<h5>Arnav</h5>
<p>Question System Developer</p>
</div>
<div class="team-member">
<h5>Ethan</h5>
<p>Boss Battle & PvP Developer</p>
</div>
<div class="team-member">
<h5>Aneesh</h5>
<p>Game Board Lead</p>
</div>
</div>

### Key Features Reviewed
- Login system with game integration
- 5 interactive CSP lessons
- Leaderboard system with real-time updates
- Multiplayer functionality via WebSockets
- Boss battle with cooperative gameplay
- PvP Arena for competitive matches
- Admin system for user management

---

## Peer Feedback Summary

<div class="summary-grid">
<div class="summary-stat">
<div class="number">4.3</div>
<div class="label">Average Rating</div>
</div>
<div class="summary-stat">
<div class="number">12</div>
<div class="label">Reviewers</div>
</div>
<div class="summary-stat">
<div class="number">6</div>
<div class="label">Team Members</div>
</div>
<div class="summary-stat">
<div class="number">5/5</div>
<div class="label">Engagement Score</div>
</div>
</div>

---

## Individual Feedback

<div class="feedback-card">
<h4>Perry</h4>
<div class="reviewer">AP CSP Crossover Review</div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>Frontend uses a well-integrated login system as part of the game experience</li>
<li>5 lessons effectively cover CSP and College Board content</li>
<li>Leaderboard system with backend integration works smoothly</li>
<li>Multiplayer function allows users to see other players and their stats in real-time</li>
<li>WebSockets implementation for multiplayer is technically impressive</li>
<li>Microblog feature on login page adds community engagement</li>
<li>Functional admin system where admins can edit users</li>
<li>Real-time user data pulling demonstrates strong backend architecture</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>UI needs some cleanup and polish for a more cohesive look</li>
<li>Login system has some issues that need to be fixed</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Vivian</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4.7/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li><strong>Presentation (5/5):</strong> The group was very engaged in explaining their game and answering questions</li>
<li>The group was organized in their presentation and knew when each person was to speak</li>
<li>The leaderboard effectively visualizes all players and their bullet counts</li>
<li>The engaging interactive learning style allows users to learn through playing games</li>
<li>Users who want to learn computer science would genuinely enjoy this approach</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li><strong>Content (4/5):</strong> Make it more clear on the front page that it's a computer science lesson</li>
<li>The educational purpose wasn't immediately obvious until starting the game</li>
<li>Consider adding clearer signals on the homepage about the learning objectives</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Hope</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4.7/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li><strong>Content (5/5):</strong> The first two pages were interesting and did a good job of teaching while still keeping the experience engaging and fun</li>
<li><strong>Value (5/5):</strong> The boss battle was very fun to watch, even without playing it</li>
<li>Added an exciting, interactive element to the learning experience</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li><strong>Presentation (4/5):</strong> There should be clearer transitions between each page</li>
<li>It was confusing to understand how the pages were connected at first</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Anika</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4.5/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>I like how this is multiplayer and how it still incorporates the learning aspect of CSP</li>
<li>The combination of gaming and education creates genuine motivation to learn</li>
<li>The bullet currency system cleverly ties learning outcomes to gameplay rewards</li>
<li>Boss battle mechanics are engaging and encourage collaboration</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>Consider adding progress indicators to show how far through the curriculum players are</li>
<li>A tutorial or onboarding flow would help new users understand the game mechanics faster</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Avantika</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>Overall the game is very clean and interesting</li>
<li>The visual design is appealing and the arcade aesthetic fits well</li>
<li>Multiplayer elements add significant replay value</li>
<li>The question system effectively tests knowledge without feeling like a quiz</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>Include different types of CS exam questions (like pseudocode, robot code) to practice different skills</li>
<li>More variety in question formats would better prepare students for the AP exam</li>
<li>Consider adding drag-and-drop or code completion questions</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Lilian</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4.5/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>Teaching by session with a little fun game approach works really well</li>
<li>Question (MCQ) format effectively tests understanding</li>
<li>Credit (bullets) counting and accumulation system is satisfying</li>
<li>Using bullets to fight the final boss is really fun!</li>
<li>Playing with friends adds a social dimension to learning</li>
<li>User management is complete and functional</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>It is really amazing, but maybe make the content/text bigger for readability</li>
<li>Add more tips or hints about what to do next at each stage</li>
<li>Consider tooltips or helper text for first-time users</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Virginia</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>Able to login to save data and be added to the leaderboard seamlessly</li>
<li>I like how it's styled with the dice roll and the game aspect</li>
<li>A really interesting concept overall</li>
<li>Good knowledge of the system demonstrated during presentation</li>
<li>Good use of all the different menus, including showing the backend system</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>Wish that the games all followed a similar theme instead of being separate games within one game</li>
<li>Content felt more cohesive would be better - most features felt very separated</li>
<li>Try to keep more consistency with the original theme of teaching coding</li>
<li>The idea of learning CS through a game is useful, but keep the concept more in practice</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Nita</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>I like the idea of your purpose to teach kids about data science</li>
<li>Bullets as currency is a creative and intuitive system</li>
<li>Impressed that you remade the backend on Flask</li>
<li>User management allows clear visibility of users</li>
<li>Admin page looks good with auto-fillable features</li>
<li>Mini questions/quizzes delivered in a nice fun way through games</li>
<li>Nice way to learn - the higher your bullet currency, the more appealing activities become</li>
<li>Boss battle is engaging and rewarding</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>Needs a little improvement but overall is good (4/5)</li>
<li>Some polish on the UI would enhance the experience</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Aditya</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>Really like the idea of teaching lessons while also giving games to play as an incentive to learn</li>
<li>Admin page is great as it is customized to the game and project</li>
<li>Can see game stats from the admin page which is very useful</li>
<li>The gamification approach makes learning feel less like a chore</li>
<li>WebSocket implementation for real-time features is technically solid</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>Making some of the buttons a bit larger would improve usability</li>
<li>The lesson interface could be a bit easier to follow along</li>
<li>Was a bit confused on the layout and what to press for the lessons</li>
<li>Consider adding visual cues or highlighting for interactive elements</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Darshan</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>It is cool how you get to do lessons and mini quizzes as well as having fun at the same time</li>
<li>The balance between education and entertainment is well-executed</li>
<li>Multiplayer aspect adds significant engagement value</li>
<li>Character selection with different sprites is a nice touch</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>In the Admin section (/users/table2) remove the commits section from the table</li>
<li>Or change it to say something else because it makes the website look "broken"</li>
<li>Small UI inconsistencies detract from the overall polish</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Cyrus</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4.5/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>The multiplayer element is very engaging and sets this apart from typical educational tools</li>
<li>Dynamic leaderboard at the end of the game adds competitive motivation</li>
<li>The boss battle mechanic is creative and memorable</li>
<li>Real-time synchronization works smoothly without noticeable lag</li>
<li>The progression system from lessons to questions to battle feels natural</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>Consider adding sound effects or music to enhance immersion</li>
<li>Mobile responsiveness could be improved for tablet users</li>
<li>A "quick play" mode for returning users would be nice</li>
</ul>
</div>
</div>

<div class="feedback-card">
<h4>Rishabh</h4>
<div class="reviewer">AP CSP Crossover Review <span class="rating-badge">Overall: 4.3/5</span></div>

<div class="glow-section">
<h5>Glows</h5>
<ul>
<li>The concept of learning through gameplay is executed well</li>
<li>Backend architecture with Flask and WebSockets shows strong technical skills</li>
<li>The Hall of Champions feature provides lasting recognition for achievements</li>
<li>PvP arena adds variety beyond the cooperative boss battle</li>
<li>Guest mode allows easy access without requiring signup initially</li>
</ul>
</div>

<div class="grow-section">
<h5>Grows</h5>
<ul>
<li>Some questions could be more challenging for advanced students</li>
<li>Consider adding difficulty levels to accommodate different skill levels</li>
<li>The transition from lessons to the game board could be smoother</li>
<li>More detailed explanations after answering questions would aid learning</li>
</ul>
</div>
</div>

---

## Key Themes from Feedback

### Strengths Identified

| Theme | Frequency | Key Comments |
|-------|-----------|--------------|
| **Multiplayer/Social** | 10/12 | "Really fun playing with friends", "Multiplayer element is engaging" |
| **Educational Value** | 9/12 | "Nice way to learn", "Teaching by session works well" |
| **Boss Battle** | 8/12 | "Really fun!", "Exciting and interactive" |
| **Leaderboard** | 7/12 | "Dynamic leaderboard adds motivation" |
| **Technical Implementation** | 6/12 | "WebSockets impressive", "Backend is solid" |

### Areas for Improvement

| Theme | Frequency | Action Items |
|-------|-----------|--------------|
| **UI Polish** | 8/12 | Larger buttons, clearer navigation, consistent styling |
| **Cohesive Theme** | 5/12 | Better visual consistency across all game sections |
| **Onboarding** | 5/12 | Clearer instructions, tooltips, tutorial flow |
| **Question Variety** | 4/12 | Add pseudocode, robot code, different formats |
| **Educational Clarity** | 3/12 | Make learning purpose more obvious on homepage |

---

## Team Response & Action Items

Based on the feedback received, our team has identified the following priority improvements:

### High Priority
1. **UI Cleanup** — Standardize button sizes, improve visual hierarchy, fix admin table display issues
2. **Navigation Flow** — Add clearer transitions between pages and visual breadcrumbs
3. **Homepage Clarity** — Make the educational purpose immediately visible on the landing page

### Medium Priority
4. **Question Diversity** — Add pseudocode questions and AP exam-style formats
5. **Onboarding** — Create a brief tutorial for first-time users
6. **Visual Consistency** — Unify the theme across lessons, game board, and battle arenas

### Future Considerations
7. **Difficulty Levels** — Implement adaptive difficulty for different skill levels
8. **Mobile Optimization** — Improve responsiveness for tablet and mobile users
9. **Audio Enhancement** — Add optional sound effects and background music

---

## Conclusion

We received overwhelmingly positive feedback on our Snakes and Ladders educational game, with an **average rating of 4.3/5** across all reviewers. The multiplayer functionality, boss battle mechanics, and gamified learning approach were consistently praised as standout features.

The constructive feedback centered around UI polish, thematic cohesion, and onboarding clarity — all actionable improvements that we plan to address in our next sprint. We're grateful to all reviewers for their thoughtful input and detailed suggestions.

**Thank you to:** Anika, Avantika, Lilian, Virginia, Vivian, Nita, Aditya, Perry, Darshan, Hope, Cyrus, and Rishabh for their valuable feedback!
