# Minimalist Dark-Mode Offline AI Chatbot UI

A high-fidelity, "anti-gravity" glassmorphic chatbot interface designed for offline RAG (Retrieval-Augmented Generation) applications. Built with **React 19**, **Vite 8**, and **Tailwind CSS v4**.

## Key Design Principles (Anti-Gravity Aesthetic)
- **Glassmorphic Panels**: Floating, translucent cards using backdrop filters, thin borders (`border-white/5`), and deep custom ambient shadows.
- **Organic Flow**: Soft glows, rounded shapes (pill-shaped buttons and inputs), and generous spacing.
- **Deep Palette**: Dark `#0f1115` base, offset by rich glass panel fills, with a vibrant emerald-green accent highlighting local/offline security states and primary actions.
- **Responsive Layout**: No edge-to-edge container locking. Everything floats elegantly.

## Structure
- [index.html](file:///C:/Users/sahim/.gemini/antigravity/scratch/antigravity-chatbot-ui/index.html): HTML Entrypoint.
- [src/main.jsx](file:///C:/Users/sahim/.gemini/antigravity/scratch/antigravity-chatbot-ui/src/main.jsx): React mounter.
- [src/App.jsx](file:///C:/Users/sahim/.gemini/antigravity/scratch/antigravity-chatbot-ui/src/App.jsx): The core chatbot interface containing state for conversation management, rename/delete actions on history, active document indexing, simulated voice processing, and user/AI floating bubble lists.
- [src/index.css](file:///C:/Users/sahim/.gemini/antigravity/scratch/antigravity-chatbot-ui/src/index.css): Core stylesheet loaded with Tailwind CSS v4 and keyframed ambient glow animations.

## Interactive Features
1. **Interactive Chat Input**: Type in the floating pill dock at the bottom and submit. It immediately clears and publishes your message.
2. **Offline Local Engine Simulation**: After sending a message, a loading state simulates the local database parsing. A simulated response is generated in ~1.2s detailing references to the active vector database.
3. **Voice Input Simulator**: Pressing the Mic icon starts a recording state (flashing red). After 3 seconds, a predefined query is simulated into the text field.
4. **Chat History Management**:
   - **Rename**: Hover over a chat item, click the pencil icon, and edit inline. Press **Enter** or click away to save.
   - **Delete**: Click the trash icon to remove the chat from the sidebar.
   - **Add Chat**: Click the **New Chat** button to start a fresh thread and name it immediately.
5. **RAG Store context**:
   - Lists active documents.
   - Hover and click the **X** icon on `Doctify_Architecture.pdf` to simulate clearing it from vector memory.

## How to Run Locally

### Start Development Server
From the root of the project, run:
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```
