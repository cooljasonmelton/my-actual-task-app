TODO: cleanup this readme

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs["recommended-typescript"],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.node.json", "./tsconfig.app.json"],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
]);
```

<!-- CODE FOR COOL RADIO GROUP -- NOT YET NEEDED -->

/\* :root {
--color-bg: #0d0d0d;
--color-bg-alt: #1a1a1a;

--color-accent-pink: #ff2d95;
--color-accent-green: #39ff14;
--color-accent-yellow: #ffef00;
--color-accent-blue: #00bfff;

--color-text: #f5f5f5;
--color-text-muted: #a3a3a3;
--color-text-invert: #000000;

--color-border: #333333;
}

.radio-group {
border: 1px solid var(--color-border);
border-radius: 0.5rem;
padding: 1rem;
background: var(--color-bg-alt);
display: flex;
flex-direction: column;
gap: 0.75rem;
}

.radio-legend {
font-size: 0.9rem;
color: var(--color-text-muted);
margin-bottom: 0.5rem;
}

.radio-option {
display: flex;
align-items: center;
cursor: pointer;
color: var(--color-text);
gap: 0.5rem;
font-size: 1rem;
position: relative;
}

.radio-option input[type="radio"] {
opacity: 0;
position: absolute;
}

.custom-radio {
width: 1rem;
height: 1rem;
border: 2px solid var(--color-border);
border-radius: 50%;
display: inline-block;
position: relative;
background: var(--color-bg);
flex-shrink: 0;
transition: border-color 0.2s ease;
} \*/

/_ checked state _/
/\* .radio-option input[type="radio"]:checked + .custom-radio {
border-color: var(--color-accent-pink);
}

.radio-option input[type="radio"]:checked + .custom-radio::after {
content: "";
position: absolute;
top: 3px;
left: 3px;
width: 6px;
height: 6px;
border-radius: 50%;
background: var(--color-accent-pink);
} \*/

/_ focus ring _/
/_ .radio-option input[type="radio"]:focus + .custom-radio {
outline: 2px solid var(--color-accent-yellow);
outline-offset: 2px;
} _/

 <fieldset className="radio-group">
      <legend className="radio-legend">Choose your vibe</legend>

      <label className="radio-option">
        <input type="radio" name="vibe" value="punk" />
        <span className="custom-radio"></span>
        Punk
      </label>

      <label className="radio-option">
        <input type="radio" name="vibe" value="lofi" />
        <span className="custom-radio"></span>
        Lo-fi
      </label>

      <label className="radio-option">
        <input type="radio" name="vibe" value="diy" />
        <span className="custom-radio"></span>
        DIY
      </label>
    </fieldset>

<!-- END CODE FOR COOL RADIO GROUP -- NOT YET NEEDED -->
