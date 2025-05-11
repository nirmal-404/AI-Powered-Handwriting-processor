# 🧠 Math Canvas Evaluator

This project is an intelligent **math canvas** that interprets and evaluates **handwritten or typed mathematical expressions**, regardless of complexity—whether it's algebra, calculus (derivatives/integrals), or basic arithmetic.

It uses **Google's Gemini API** to perform accurate and context-aware mathematical reasoning.

---

## ✨ Features

- ✅ Solve equations (e.g., `3x + 2y = 12`)
- ✅ Compute derivatives (e.g., `d/dx(x² + 2x)`)
- ✅ Evaluate indefinite and definite integrals (e.g., `∫(2x + 3x²) dx`, `∫₀²(2x + 3x²) dx`)
- ✅ Recognizes input from a canvas (image-based)
- ✅ Real-time results shown on the frontend

---

## 🔧 Tech Stack

| Layer       | Tech                             |
|-------------|----------------------------------|
| Frontend    | React, TypeScript, ESLint        |
| Backend     | FastAPI, Python, Pillow, Uvicorn |
| AI Engine   | Google Gemini API                |
| Environment | `.venv`, Python Dotenv           |

---

## ⚙️ Setup Instructions

### Backend

```bash
# Create virtual environment
python -m venv .venv

# Activate environment (Windows)
.venv\Scripts\Activate

# Install dependencies
pip install fastapi Pillow uvicorn pydantic google-generativeai python-dotenv

# Run the server
python main.py
