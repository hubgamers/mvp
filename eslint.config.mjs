import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Bloc de configuration pour désactiver ou assouplir des règles spécifiques
  {
    rules: {
      // Exemple : désactiver complètement les erreurs sur les variables non utilisées
      "@typescript-eslint/no-unused-vars": "off",
      
      // Exemple : désactiver les balises <img> non optimisées de Next.js si besoin
      "@next/next/no-img-element": "off",

      // Exemple : transformer une erreur de règle React en simple avertissement (pour ne pas bloquer le build)
      "react/no-unescaped-entities": "warn",
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;