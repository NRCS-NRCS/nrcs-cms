import { ValidateEnv as validateEnv } from '@togglecorp/vite-plugin-validate-env';
import reactSwc from '@vitejs/plugin-react-swc';
// import { execSync } from 'child_process';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import { compression } from 'vite-plugin-compression2';
import svgr from 'vite-plugin-svgr';
import webfontDownload from 'vite-plugin-webfont-dl';
import tsconfigPaths from 'vite-tsconfig-paths';

import { execSync } from 'child_process';


/* Get commit hash */
function getCommitHash(): string {
    if (process.env.APP_COMMIT_HASH) {
        return process.env.APP_COMMIT_HASH;
    }

    try {
        return execSync('git rev-parse --short HEAD').toString().trim();
    } catch (error) {
        throw new Error(
            'Unable to determine commit hash. You must either provide a commit hash using the APP_COMMIT_HASH environment variable,' +
            ' or provide a valid Git repository (submodule doesn\'t work with docker).'
        );
    }
}

const commitHash = getCommitHash();

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    const isProd = mode === 'production';
    return {
        define: {
            APP_COMMIT_HASH: JSON.stringify(commitHash),
        },
        plugins: [
            isProd ? checker({
                typescript: true,
                eslint: {
                    lintCommand: 'eslint ./app',
                },
                stylelint: {
                    lintCommand: 'stylelint "./app/**/*.css"',
                },
            }) : undefined,
            svgr(),
            reactSwc(),
            tsconfigPaths(),
            webfontDownload(),
            validateEnv({
                configFile: 'env',
            }),
            isProd ? compression() : undefined,
        ],
        css: {
            devSourcemap: isProd,
            modules: {
                scopeBehaviour: 'local',
                localsConvention: 'camelCaseOnly',
            },
        },
        envPrefix: 'APP_',
        server: {
            port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
            strictPort: true,
        },
        build: {
            outDir: 'build',
            sourcemap: isProd,
        },
        test: {
            exclude: [
                'node_modules', // Standard exclusion
                '.pnpm-store', // pnpm store files
            ],
            environment: 'happy-dom',
        },
    };
})