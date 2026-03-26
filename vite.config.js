import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

const getHtmlEntries = () => {
    const publicPath = resolve(__dirname, 'public');
    const entries = {};
    readdirSync(publicPath).forEach((file) => {
        if (file.endsWith('.html')) {
            entries[file.replace('.html', '')] = resolve(publicPath, file);
        }
    });
    return entries;
};

export default defineConfig({
    root: 'public',
    base: '/',
    publicDir: resolve(__dirname, 'static'),
    plugins: [],
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            },
        },
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: getHtmlEntries(),
        },
    },
});
