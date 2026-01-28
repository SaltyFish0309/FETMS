/** @type {import('tailwindcss').Config} */
export default {
    darkMode: 'class',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                heading: ['Poppins', 'Microsoft JhengHei', 'Heiti TC', 'sans-serif'],
                body: ['Open Sans', 'Microsoft JhengHei', 'Heiti TC', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
