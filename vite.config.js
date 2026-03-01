import { defineConfig } from 'vite';
import { resolve } from 'path';
import { readdirSync } from 'fs';

// Helper to get all HTML files in public as entry points
const getHtmlEntries = () => {
    const publicPath = resolve(__dirname, 'public');
    const files = readdirSync(publicPath);
    const entries = {};
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const name = file.replace('.html', '');
            entries[name] = resolve(publicPath, file);
        }
    });
    return entries;
};

export default defineConfig({
    root: 'public',
    base: '/',
    publicDir: resolve(__dirname, 'static'),
    server: {
        port: 5173,
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true,
            }
        }
    },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        rollupOptions: {
            input: getHtmlEntries()
        }
    }
});
