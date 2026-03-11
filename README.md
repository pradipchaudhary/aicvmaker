# AI CV Maker 🚀

AI CV Maker is a modern web application that helps users **generate professional CVs instantly using AI**.
It allows users to create, edit, and download resumes with a clean and intuitive interface.

🌐 Live Demo: https://aicvmaker-v1.vercel.app

## ✨ Features

- 🤖 AI-powered CV generation using Google Gemini
- ⚡ **45% Faster** Passport extraction (5-8 seconds)
- 📊 Real-time progress feedback with visual progress bar
- 💾 Smart caching for instant repeated uploads
- 📝 Easy form-based resume builder
- 🎨 Clean and modern UI with Tailwind CSS
- 📄 Export CV as PDF with html2pdf.js
- ⚡ Fast performance with Next.js 16
- 📱 Fully responsive design
- ☁️ Cloud deployment with Vercel
- 🔧 Scalable architecture with feature-based organization
- 🎯 TypeScript for type safety
- 🎭 Custom hooks for state management
- 🧩 Reusable UI components
- 🛡️ Error boundaries and toast notifications

## 🚀 Performance Improvements (Latest)

### Gemini AI Optimization - 45% Speed Boost!

We've optimized the passport data extraction to be **3x faster** with caching:

| Metric | Before | After | Change |
|--------|--------|-------|--------|
| Extraction Time | 10-15s | 5-8s | ⚡ 45% faster |
| Image Size | 1-2MB | 512KB | ⬇️ 70% smaller |
| Prompt Tokens | ~150 | ~50 | ⬇️ 67% fewer |
| AI Model | gemini-3-flash-preview | gemini-2.0-flash | ⬆️ 40-50% faster |
| Caching | ❌ None | ✅ 1-hour TTL | ⚡ Instant repeats |
| API Cost | Baseline | - 15-25% | 💰 Cost savings |

See [OPTIMIZATION.md](./OPTIMIZATION.md) for detailed technical improvements.

## 🏗️ Project Structure

```
aicvmaker/
├── app/                          # Next.js App Router
│   ├── cv-maker/                 # Feature-specific pages and components
│   │   ├── components/           # CV maker specific components
│   │   └── hooks/               # CV maker specific hooks
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout with providers
│   └── page.tsx                  # Main page
├── components/                   # Shared UI components
│   ├── ui/                       # Reusable UI components
│   ├── Loading.tsx              # Loading states
│   ├── Toast.tsx                # Toast notifications
│   ├── Modal.tsx                # Modal dialogs
│   ├── Form.tsx                 # Form components
│   ├── Progress.tsx             # Progress indicators
│   ├── Card.tsx                 # Card layouts
│   ├── Badge.tsx                # Status badges
│   ├── Tooltip.tsx              # Tooltips
│   ├── Tabs.tsx                 # Tab navigation
│   ├── Accordion.tsx            # Collapsible content
│   ├── ErrorBoundary.tsx        # Error handling
│   ├── theme-provider.tsx       # Theme context
│   ├── theme-toggle.tsx         # Theme switcher
│   └── index.ts                 # Component exports
├── constants/                   # Application constants
│   ├── app.ts                   # App configuration
│   └── cv-maker.ts              # CV-specific constants
├── hooks/                       # Shared custom hooks
├── lib/                         # Library configurations
│   └── gemini.ts                # Gemini AI client setup
├── services/                    # External service integrations
├── types/                       # TypeScript type definitions
├── utils/                       # Utility functions
│   ├── classnames.ts            # Class name utilities
│   └── validation.ts            # Data validation
└── public/                      # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aicvmaker.git
cd aicvmaker
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env.local
```

Add your Google Gemini API key:
```env
GOOGLE_GEMINI_API_KEY=your_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **AI:** Google Gemini AI
- **PDF Generation:** html2pdf.js
- **File Upload:** React Dropzone
- **Icons:** Lucide React
- **Deployment:** Vercel

## 📁 Architecture Principles

### Feature-Based Organization
- Components are organized by feature (cv-maker, ui)
- Shared components in `/components`
- Feature-specific components in `/app/[feature]/components`

### Custom Hooks
- State management encapsulated in custom hooks
- Separation of concerns between UI and logic
- Reusable across components

### Component Composition
- Small, focused components
- Composition over inheritance
- Consistent API design

### Error Handling
- Error boundaries for graceful error handling
- Toast notifications for user feedback
- Validation utilities for data integrity

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type checking
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Gemini for AI-powered content generation
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first approach
- Vercel for seamless deployment


