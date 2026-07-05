import js from "@eslint/js";
import jsxA11y from "eslint-plugin-jsx-a11y";
import react from "eslint-plugin-react";
import reactCompiler from "eslint-plugin-react-compiler";
import reactHooks from "eslint-plugin-react-hooks";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import unusedImports from "eslint-plugin-unused-imports";
import globals from "globals";
import tseslint from "typescript-eslint";

import prettier from "eslint-config-prettier";

import radial from "./scripts/eslint-plugin-radial.js";

export default tseslint.config(
	{
		ignores: [
			"dist",
			"dist-demo",
			"storybook-static",
			"coverage",
			"node_modules",
			"examples/**",
			".cursor/skills/**",
		],
	},
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: "module",
			globals: { ...globals.browser, ...globals.node },
			parserOptions: { ecmaFeatures: { jsx: true } },
		},
		plugins: {
			react,
			"react-hooks": reactHooks,
			"jsx-a11y": jsxA11y,
			"simple-import-sort": simpleImportSort,
			"unused-imports": unusedImports,
			"react-compiler": reactCompiler,
			radial,
		},
		settings: { react: { version: "detect" } },
		rules: {
			...react.configs.recommended.rules,
			...react.configs["jsx-runtime"].rules,
			...reactHooks.configs.recommended.rules,
			...jsxA11y.configs.recommended.rules,
			"react/prop-types": "off",
			"react-compiler/react-compiler": "warn",
			"simple-import-sort/imports": "error",
			"simple-import-sort/exports": "error",
			"unused-imports/no-unused-imports": "error",
			"@typescript-eslint/no-unused-vars": "off",
			"unused-imports/no-unused-vars": [
				"warn",
				{ argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
			],
			curly: ["error", "all"],
			"max-lines": ["error", { max: 400, skipBlankLines: true, skipComments: true }],
			"max-lines-per-function": [
				"error",
				{ max: 250, skipBlankLines: true, skipComments: true },
			],
			"max-depth": ["error", 4],
			"@typescript-eslint/no-explicit-any": "error",
			"radial/no-magic-numbers": ["warn", { ignore: [0, 1, -1] }],
			"id-length": [
				"warn",
				{
					min: 3,
					exceptions: ["i", "j", "k", "x", "y", "z", "id", "fn", "cb", "el", "cx", "cy"],
				},
			],
		},
	},
	{
		files: ["**/*.{js,cjs,mjs}"],
		languageOptions: {
			globals: { ...globals.node },
		},
	},
	{
		files: ["tests/**", "**/*.stories.tsx", "demo/**"],
		rules: {
			"radial/no-magic-numbers": "off",
			"simple-import-sort/imports": "off",
			"simple-import-sort/exports": "off",
			"max-lines-per-function": "off",
			"max-lines": "off",
			"id-length": "off",
		},
	},
	prettier,
);
