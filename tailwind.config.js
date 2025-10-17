/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paper textures
        'cream-paper': '#faf7f0',
        'aged-paper': '#f5f1e8',
        'notebook-lines': '#e8e3d8',
        'margin-red': '#d63384',
        
        // Ink colors
        'fountain-pen-blue': '#1e3a8a',
        'pencil-graphite': '#374151',
        'red-pen': '#dc2626',
        'highlighter-yellow': '#fef08a',
        
        // Physical elements
        'binding-holes': '#d1d5db',
        'spiral-wire': '#9ca3af',
      },
      fontFamily: {
        'sans': ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
        'handwritten': ['Dancing Script', 'cursive'],
        'handwritten-casual': ['Kalam', 'cursive'],
        'handwritten-playful': ['Caveat', 'cursive'],
        'handwritten-bold': ['Amatic SC', 'cursive'],
        'handwritten-natural': ['Patrick Hand', 'cursive'],
        'handwritten-cute': ['Indie Flower', 'cursive'],
        'handwritten-elegant': ['Shadows Into Light', 'cursive'],
        'handwritten-marker': ['Permanent Marker', 'cursive'],
        'serif': ['ui-serif', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
        'script': ['Dancing Script', 'cursive'],
        'mono': ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'paper': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  plugins: [],
}