# 🚀 Okleevo - 20-in-1 Micro SaaS Platform

A comprehensive, all-in-one business platform designed specifically for UK SMEs. 20 integrated modules covering finance, CRM, productivity, and operations - all in one unified workspace with a stunning modern UI.

## 🎯 Overview

**Okleevo** eliminates complexity, cost, and clutter by providing everything your SME needs in a single platform. Built with modern technologies, beautiful UI design, and UK compliance in mind.

- **Subscription Model**: £19.99/month (All 20 modules included)
- **Target Market**: UK SMEs (Micro to Small businesses)
- **Core USP**: One unified workspace with modern, fluid UI
- **Design Philosophy**: Beautiful, intuitive, and powerful

## ✨ Key Features

- 🎨 **Modern UI Design**: Gradient backgrounds, glassmorphic effects, smooth animations
- 📊 **Comprehensive Dashboard**: Real-time business metrics and quick actions
- 💼 **Complete Business Suite**: 20 integrated modules for all business needs
- 🇬🇧 **UK Compliance**: VAT calculations, GDPR compliance, UK date formats
- 🤖 **AI-Powered**: Gemini for quality content, Groq for speed
- 📱 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🔒 **Secure**: Enterprise-grade security with JWT authentication

## 🚀 Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MongoDB
- **Payments**: Stripe
- **AI/LLM**: 
  - Gemini API (High-quality content generation)
  - Groq API (High-speed, low-latency processing)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4

## 📦 The 20 Modules

### Finance & Cash Flow (Modules 1-4)
1. **Mini Invoicing & Quotes** - UK VAT compliant invoicing with Stripe payment links
2. **Cashflow & Bills Snapshot** - 3-month cash flow visualization and bill tracking
3. **Expense & Receipt Capture** - Receipt upload and categorization
4. **VAT Calculator & Checker** - VAT calculations and HMRC validation

### Customer & Leads (Modules 5-9)
5. **Lite CRM & Contacts Hub** - Central customer data repository
6. **Leads Capture & Web Forms** - Drag-and-drop form builder with embed codes
7. **Appointment & Booking** - Availability management and booking widget
8. **Customer Helpdesk Lite** - Shared inbox and ticket management
9. **Email & WhatsApp Campaign** - Basic list segmentation and broadcasts

### Productivity & AI (Modules 10-13)
10. **Task & Micro-Project Board** - Kanban board with auto-generated tasks
11. **AI Content Assistant** - High-quality content generation (Gemini)
12. **AI Meeting & Call Notes** - Rapid transcription and summarization (Groq)
13. **Simple KPI & Dashboard Tiles** - Real-time business health metrics

### Operations & Compliance (Modules 14-20)
14. **Micro Inventory & Stock** - Simple SKU management with alerts
15. **Supplier & Order Tracker** - Purchase order tracking
16. **Micro HR & Staff Records** - Staff management and document storage
17. **Onboarding Checklist Builder** - Reusable process templates
18. **Documents & E-Signature Lite** - Document templates and e-approval
19. **Website & Landing Micro-Pages** - Simple single-page builder
20. **Compliance & Policy Reminders** - UK statutory deadline tracking

## 🏗️ Project Structure

```
/sme-hub-20
├── /app                    # Next.js App Router
│   ├── /api               # API routes (Stripe, AI, CRM, etc.)
│   ├── /dashboard         # Main workspace
│   ├── /auth              # Authentication
│   └── /billing           # Subscription management
├── /components            # Reusable UI components
│   ├── /ui               # Design system primitives
│   └── /drag-and-drop    # Workspace drag-and-drop logic
├── /config               # Environment variables & settings
├── /db                   # MongoDB connection
├── /lib                  # Shared utilities & services
│   ├── /types           # TypeScript type definitions
│   ├── /utils           # Helper functions
│   └── /services        # Service wrappers
├── /models              # MongoDB schemas
└── /modules             # The 20 self-contained modules
```

## 🎨 Design System

The platform features a stunning, modern UI design with:

### Visual Design
- **Gradient Backgrounds**: Beautiful color transitions (purple-blue, pink-orange, cyan-blue)
- **Glassmorphic Effects**: Modern backdrop blur and transparency
- **Smooth Animations**: Hover effects, scale transitions, and fluid movements
- **Shadow Depth**: Multi-layered shadows for depth and hierarchy
- **Rounded Corners**: Consistent border-radius for modern aesthetics

### Color Schemes by Module
- **Dashboard**: Purple to blue gradients
- **Invoicing**: Indigo to purple tones
- **Cashflow**: Emerald to teal gradients
- **Expenses**: Rose to pink hues
- **VAT Tools**: Amber to orange
- **CRM**: Blue to cyan gradients
- **Compliance**: Violet to purple
- **Forms**: Purple to blue
- **Booking**: Blue to purple
- **Helpdesk**: Indigo to purple
- **Campaigns**: Pink to orange
- **Tasks**: Cyan to blue

### UI Components
- **Stat Cards**: White cards with gradient icons and hover effects
- **Action Buttons**: Gradient backgrounds with shadow and scale animations
- **Modal Dialogs**: Clean, modern overlays with gradient headers
- **Form Inputs**: Bordered inputs with focus states and transitions
- **Data Cards**: Enhanced cards with gradient accents and hover states
- **Empty States**: Friendly illustrations and helpful messaging

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader friendly
- High contrast ratios
- Focus indicators

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB instance (local or Atlas)
- Stripe account (for payments)
- Gemini API key (for AI content)
- Groq API key (for AI processing)

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/gbabudoh/okleevo.git
cd okleevo
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
Create a `.env.local` file in the root directory:
```env
# MongoDB
MONGODB_URI=your_mongodb_connection_string
MONGODB_DB_NAME=okleevo

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI APIs
GEMINI_API_KEY=your_gemini_api_key
GROQ_API_KEY=your_groq_api_key

# Authentication
JWT_SECRET=your_jwt_secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# App Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

### Quick Start Guide

1. **Sign Up**: Create your account at `/auth/signup`
2. **Explore Dashboard**: View your business overview
3. **Add Data**: Start with CRM contacts or create an invoice
4. **Customize**: Set up your preferences and integrations
5. **Invite Team**: Add team members to collaborate

## 🔧 Development

### Key Features

- **Module Integration**: All modules share data through centralized MongoDB schemas
- **CRM as Hub**: Customer data flows between modules seamlessly
- **Task Aggregation**: Auto-generated tasks from multiple modules
- **AI Integration**: Gemini for quality, Groq for speed
- **UK Compliance**: VAT calculations, GDPR compliance, UK date formats

### Adding a New Module

1. Create module folder in `/modules/[module-name]`
2. Define MongoDB schema in `/models`
3. Create API routes in `/app/api/[module-name]`
4. Build UI components following the design system
5. Integrate with CRM and Task Board

## 📝 Environment Variables

See `.env.example` for all required environment variables.

## 🧪 Testing

```bash
npm run lint
```

## 📸 Screenshots

### Main Dashboard
Modern overview with gradient stat cards, quick actions, and recent activity.

### Module Highlights
- **Invoicing**: Professional invoice creation with PDF export
- **CRM**: Complete customer management with email integration
- **Task Board**: Beautiful Kanban board with drag-and-drop
- **Campaigns**: Email marketing with performance analytics
- **Forms**: Drag-and-drop form builder with embed codes

## 🎯 Roadmap

### Phase 1 (Current)
- ✅ Core 20 modules implemented
- ✅ Modern UI design system
- ✅ Authentication and authorization
- ✅ MongoDB integration
- ✅ Responsive design

### Phase 2 (Q1 2025)
- 🔄 Stripe payment integration
- 🔄 AI content generation (Gemini)
- 🔄 AI transcription (Groq)
- 🔄 Advanced analytics
- 🔄 Mobile app (React Native)

### Phase 3 (Q2 2025)
- 📋 API for third-party integrations
- 📋 White-label options
- 📋 Advanced automation
- 📋 Multi-language support
- 📋 Advanced reporting

## 🐛 Known Issues

- None currently reported

## 📝 Changelog

### Version 1.0.0 (December 2024)
- Initial release with all 20 modules
- Modern UI design implementation
- Complete dashboard redesign
- Enhanced module interfaces
- Improved user experience

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write meaningful commit messages
- Add comments for complex logic
- Test your changes thoroughly
- Update documentation as needed

## 📄 License

Private - All rights reserved © 2024 Okleevo

## 📧 Contact & Support

- **Website**: [okleevo.com](https://okleevo.com)
- **Email**: support@okleevo.com
- **GitHub**: [github.com/gbabudoh/okleevo](https://github.com/gbabudoh/okleevo)
- **Issues**: [GitHub Issues](https://github.com/gbabudoh/okleevo/issues)

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for hosting and deployment
- MongoDB for the database solution
- Stripe for payment processing
- The open-source community

---

**Built with ❤️ for UK SMEs | Okleevo - Your All-in-One Business Platform**
