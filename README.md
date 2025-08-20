# Academic Mini Crossword

An internal web application built to help **tutors** create and share **5x5 academic crosswords** with their students.  
The project streamlines tutor prep, reinforces subject-specific terminology, and gamifies review sessions — improving both **efficiency for tutors** and **engagement for students**.

---

## Problem & Impact
Tutors often need quick, engaging activities to reinforce key concepts. Preparing these activities manually is time-consuming and inconsistent across sessions.

**With Academic Mini Crossword:**
- Tutors can generate a subject-specific puzzle in under **2 minutes**.  
- Puzzles are **stored, tagged, and reusable**, reducing redundant prep work.  
- Students engage with academic material through an **interactive, gamified experience**.  
- The tool is scalable: future tutors can build on a growing library of puzzles.  

This reduces prep time, **standardizes materials**, and ensures students are practicing terminology in a fun and memorable way.

---

## 🛠️ Technical Implementation

### Frontend
- Built with **React + Next.js** for modular, server-rendered components.  
- **Dynamic grid generator** automatically converts tutor inputs (clues/answers) into a playable crossword layout.  
- **TailwindCSS** used for consistent, accessible styling (color-blind safe palettes, responsive grid).  

### Backend & Database
- **Firebase Firestore** stores puzzle metadata (clues, answers, subject tags).  
- **Firebase Security Rules** restrict writes to authorized tutors and limit deletions to admins.  
- **Access Control** implemented via an **access code system** (currently `TC2025`) to prevent unauthorized puzzle creation.  

### Hosting & Deployment
- Deployed on **Vercel** with CI/CD from GitHub.  
- Automatic redeployment on commits → ensures tutors always see the latest stable version.  

### Utilities
- **NanoID** used to generate unique puzzle IDs for reliable puzzle lookup and sharing.  

---
## ✨ Features

### Tutor Features
- **Puzzle Creation Form** → Enter 5 across-only clues & answers (up to 15 characters).  
- **Automatic Grid Generation** → Preview the crossword grid as clues/answers are entered.  
- **Tagging System** → Label puzzles by subject/topic (e.g., *“CS 1412 – Functions”*).  
- **Puzzle Library** → Access all previously created puzzles in a central hub.  
- **Admin Controls** → Database cleanup & deletion restricted to admin-level access in Firebase.  

### Student Features
- **Interactive Play Mode** → Students solve puzzles directly in the browser with instant feedback.  
- **Hints & Error Checking** → Optional features to assist learning.  
- **Completion Celebration** → A simple animation or confirmation when puzzle is solved.  
- **Optional Timer** → Competitive mode to make solving more engaging (similar to NYT Mini).  

### System Features
- **Secure Puzzle Storage** → Puzzles saved in Firebase Firestore.  
- **Access Control** → Tutors must enter a passcode (currently `TC2025`) to create puzzles.  
- **Data Privacy** → No student identifiers or IP addresses are stored.  
---
## 🔒 Security & Privacy
- No student names, identifiers, or IP addresses are stored.  
- Puzzles are tutor-labeled (e.g., `CS1412-mini`) for reuse without exposing personal data.  
- Access code system ensures only TC tutors can create puzzles.  
- Admin-only deletion prevents accidental data loss.  

---
