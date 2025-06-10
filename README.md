# Quiz-App
Application that simulate a quiz tests

## 🏗️ Architecture & Implementation Decisions

### 📸 Image Service & Caching
The **Image Service** was implemented to provide efficient image retrieval with intelligent caching capabilities:
- Uses **TanStack Query** for automatic caching and background refetching
- Implements **native Image constructor** for optimal loading performance
- Provides **5-minute stale time** and **10-minute garbage collection** for memory management
- **Automatic deduplication** prevents multiple network requests for the same image
- **Exponential backoff retry logic** for improved reliability

### ⏱️ Timer Directive vs Component
The **Timer Directive** was chosen over a component to provide maximum flexibility:
- **Flexible styling** - Can be applied to any element with custom appearance
- **Minimal HTML footprint** - No additional wrapper elements
- **Reusable across contexts** - Same timer logic with different visual presentations
- **Easy integration** - Simple `[appTimer]="30"` attribute application
- **Maintains host element semantics** - Preserves original element structure

### 🚦 No Routing Implementation
Routing was intentionally **not implemented** as the current approach is more effective for this quiz application:

**Benefits of Current Approach:**
- **Better UX for linear flows** - Quiz progression is sequential and controlled
- **Simplified state management** - Single component manages entire quiz flow
- **No route guards complexity** - Built-in flow control prevents invalid navigation
- **Faster transitions** - No route resolution or component destruction/creation overhead
- **Easier progress tracking** - Centralized state for current question, answers, and completion
- **Better for timed scenarios** - Timer state persists across question changes
- **Mobile-friendly** - No browser back button complications during quiz

### 🎨 Development Approach

**Styling Implementation:**
- **AI-assisted styling** for rapid UI development and consistent design patterns
- **Palo Alto Networks inspired color scheme** for professional appearance
- **Tailwind CSS** for utility-first responsive design

**Logic & Design:**
- **Core application logic and architecture designed by developer**
- **Business rules and quiz flow logic** implemented with careful consideration
- **Component structure and data flow** planned for maintainability and scalability

### 🔄 Minimal Disruption Philosophy
**Existing mechanisms were preserved** to maintain stability:
- **Maintained original quiz service patterns**
- **Extended existing component interfaces** rather than replacing them
- **Preserved original data structures** and API contracts
- **Enhanced functionality without breaking existing features**

### 📁 Project Structure & Organization

#### Feature-Specific Components
**Related components and services are co-located:**
```
src/app/components/
├── quiz/                    # Quiz orchestration
├── question/               # Question display logic
├── welcome/               # User onboarding
├── summary/               # Results presentation
└── question-side-panel/   # Navigation components
```

#### Shared & Core Architecture
**Reusable components in dedicated folders:**
```
src/app/shared/
├── components/
│   ├── checkbox/          # Generic form controls
│   ├── image/            # Image display with caching
│   └── progress-bar/     # Progress indicators
├── directives/
│   └── timer/            # Time management
└── services/
    └── image.service.ts  # Image caching logic

src/app/core/
└── services/             # Application-wide services
```

**Structure Benefits:**
- **Easy feature isolation** - Related code stays together
- **Reusable components** - Shared utilities available app-wide
- **Clear separation of concerns** - Feature vs infrastructure code
- **Scalable architecture** - New features can follow established patterns

---

## 🚀 Key Features
- ✅ **Intelligent image caching** with TanStack Query
- ✅ **Flexible timer system** with directive approach  
- ✅ **Professional UI** with Palo Alto-inspired design
- ✅ **Optimized quiz flow** without routing complexity
- ✅ **Modular architecture** with clear separation of concerns
- ✅ **Type-safe implementation** with Angular signals and modern patterns
