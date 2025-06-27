# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

I have addressed the `Firebase: Error (auth/invalid-api-key)` issue. Here's a summary of the changes and the next steps you need to take:

### Root Cause

The error was caused by placeholder credentials in the `src/firebase.ts` file.

### Solution

1.  **Switched to Environment Variables**: I updated `src/firebase.ts` to use environment variables for your Firebase configuration. This is a more secure and flexible approach.

2.  **Configuration Template**: I created a file named `env.txt` in the root of your project. This file contains all the necessary environment variables.

### Your Next Steps

1.  **Create a `.env` file**: Create a new file named `.env` in the root of your project.

2.  **Populate `.env`**: Copy the contents of `env.txt` into your new `.env` file.

3.  **Add Your Credentials**: Replace the placeholder values (e.g., `"YOUR_API_KEY"`) in the `.env` file with your actual Firebase project credentials. You can find these in your Firebase project settings.

4.  **Production Environment**: For your live website, you must also add these same environment variables to your hosting provider's settings (e.g., Netlify, Vercel, etc.).

Your `.gitignore` file is already set up to ignore `.env` files, so your credentials will not be committed to your repository.

Once you've completed these steps, the error on your live site should be resolved.
"# Study-Tracker" 
