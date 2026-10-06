import {defineConfig, globalIgnores} from 'eslint/config';
import next from 'eslint-config-next/core-web-vitals';
import typescript from 'eslint-config-next/typescript';
export default defineConfig([...next,...typescript,globalIgnores(['.next/**','.next-static/**','out/**','dist/**','test-results/**','playwright-report/**','docs/qa/**'])]);
