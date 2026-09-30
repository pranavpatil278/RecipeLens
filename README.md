# RecipeLens

RecipeLens is an AI-powered food recognition and recipe generation application that allows users to upload or capture a photo of a dish and instantly get recipe information. The application uses AI to analyze food images and generate ingredients, cooking instructions, cooking time, calories, nutrition information, and helpful cooking tips.

## Architecture Overview

```text

                         USER INTERFACE (React + Vite)
┌──────────────────────────────────────────────────────────────────────────────┐
│                         RecipeLens Web Application                          │
│                                                                              │
│  Landing Page          Food Scanner             Recipe Experience            │
│  - Hero Section        - Camera Capture        - Dish Information            │
│  - Scroll Animation    - Image Upload          - Ingredients                  │
│  - Features            - Image Preview         - Cooking Steps                │
│  - Scan Food CTA       - AI Processing         - Nutrition                    │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
                           GOOGLE GEMINI AI
┌──────────────────────────────────────────────────────────────────────────────┐
│  1. Analyze food image                                                       │
│  2. Identify the dish                                                        │
│  3. Generate recipe                                                          │
│  4. Generate ingredients                                                     │
│  5. Generate cooking instructions                                            │
│  6. Provide cooking time and difficulty                                     │
│  7. Estimate calories and nutrition                                         │
│  8. Generate cooking tips and substitutions                                 │
└─────────────────────────────────────┬────────────────────────────────────────┘
                                      │
                                      ▼
                              RECIPE RESULTS
┌──────────────────────────────────────────────────────────────────────────────┐
│ Dish Name • Ingredients • Cooking Steps • Cooking Time • Nutrition           │
│ Calories • Difficulty • Tips • Substitutions                                │
└──────────────────────────────────────────────────────────────────────────────┘
````

## Core Features

* **Food Image Upload**: Upload a dish photo directly from your device.
* **Camera Capture**: Capture a food image using your device camera.
* **AI Food Recognition**: Analyze the uploaded image and identify the dish.
* **AI Recipe Generation**: Generate a detailed recipe based on the detected dish.
* **Ingredients List**: Get the ingredients required to prepare the dish.
* **Step-by-Step Instructions**: Follow clear cooking instructions.
* **Cooking Information**: View preparation time, cooking time, servings, and difficulty.
* **Nutrition Information**: Get estimated calories and nutritional details.
* **Cooking Tips**: Receive useful cooking suggestions and recommendations.
* **Ingredient Substitutions**: Get possible alternatives for ingredients.
* **Recent Recipes**: Keep track of recently generated recipes.
* **Responsive Design**: Designed to work across desktop, tablet, and mobile devices.
* **Interactive UI**: Smooth animations and modern interactions.
* **Scroll-Based Hero Animation**: Cinematic image-sequence animation controlled by scrolling.

## How RecipeLens Works

```text
Upload / Capture Food Image
            ↓
       Image Preview
            ↓
        AI Analysis
            ↓
      Dish Identification
            ↓
      Recipe Generation
            ↓
 ┌──────────┼──────────┐
 ↓          ↓          ↓
Recipe   Ingredients  Nutrition
 ↓          ↓          ↓
 └──────────┼──────────┘
            ↓
       Recipe Results
```

## Project Structure

```text
RecipeLens/
├── public/
│   ├── frames/                 # Scroll-based animation frames
│   └── assets/                 # Images and static assets
│
├── src/
│   ├── components/             # Reusable UI components
│   ├── services/               # API and AI services
│   ├── utils/                  # Utility functions
│   ├── App.tsx                 # Main application
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
│
├── .env.example                # Environment variable template
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/pranavpatil278/RecipeLens.git
cd RecipeLens
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
```

Do not commit `.env.local` or your actual API key to GitHub.

### 4. Start the development server

```bash
npm run dev
```

Open the local URL shown in the terminal.

### 5. Create a production build

```bash
npm run build
```

### 6. Preview the production build

```bash
npm run preview
```

## Environment Variables

| Variable         | Description                     |
| ---------------- | ------------------------------- |
| `GEMINI_API_KEY` | Google Gemini API key           |
| `GEMINI_MODEL`   | Gemini model used by RecipeLens |

## Technologies Used

* React
* Vite
* TypeScript
* JavaScript
* Google Gemini API
* Three.js
* Motion
* React Markdown
* CSS / Tailwind CSS

## Future Improvements

* More advanced food recognition
* Ingredient detection
* Personalized recipe recommendations
* Voice-guided cooking
* Grocery list generation
* Multi-language recipes
* Nutrition tracking
* Mobile application
* Cloud recipe storage

## 👨‍💻 Author

**Pranav Patil**

GitHub: [https://github.com/pranavpatil278](https://github.com/pranavpatil278)

LinkedIn: [https://www.linkedin.com/in/pranav-patil-5a3a793aa](https://www.linkedin.com/in/pranav-patil-5a3a793aa)

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub. Your support is appreciated!

```
```
