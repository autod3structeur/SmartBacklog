/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'kanban-bg': '#f3f4f6',
        'todo-header': '#2563eb',
        'doing-header': '#d97706',
        'done-header': '#059669',
      },
    },
  },
  plugins: [],
}
