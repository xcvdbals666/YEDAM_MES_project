import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
    optimizeDeps: {
        noDiscovery: true
    },
    plugins: [
        vue(),
        tailwindcss(),
        Components({
            resolvers: [PrimeVueResolver()]
        })
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    server: {
        // 프록시 설정.
        proxy: {
            // 생산
            '/produce': {
                target: 'http://localhost:3000',
                changeOrigin: true // 대상서버의 출처를 변경.
            },
            // 자재
            '/material': {
                target: 'http://localhost:3000',
                changeOrigin: true // 대상서버의 출처를 변경.
            },
            // 품질
            '/quality': {
                target: 'http://localhost:3000',
                changeOrigin: true // 대상서버의 출처를 변경.
            },
            // 주문
            '/order': {
                target: 'http://localhost:3000',
                changeOrigin: true // 대상서버의 출처를 변경.
            }
        }
    }
});
