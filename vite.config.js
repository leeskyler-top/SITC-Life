import {fileURLToPath, URL} from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite';
// import AutoImport from "unplugin-auto-import/vite"
import Components from 'unplugin-vue-components/vite';
import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// 兼容性插件
// import legacy from '@vitejs/plugin-legacy'
// import PostCssPresetEnv from 'postcss-preset-env';
// import {babel} from '@rollup/plugin-babel';
// import autoprefixer from "autoprefixer";

export default defineConfig({
    plugins: [
        vue(),
        Components({
            resolvers: [
                AntDesignVueResolver({
                    importStyle: false, // css in js
                }),
            ],
        }),
        // legacy({
        //     targets: [
        //         "> 0.5%, last 1 version, ie >= 11",
        //         "safari >= 13",
        //         // "Android > 39",
        //         // "Chrome >= 60",
        //         // "Safari >= 10.1",
        //         "iOS > 13",
        //         // "Firefox >= 54",
        //         // "Edge >= 15"
        //     ],
        //     additionalLegacyPolyfills: ["regenerator-runtime/runtime"],
        //     polyfills: ["es.promise.finally", "es/map", "es/set"],
        //     renderLegacyChunks:true,
        //     // modernPolyfills: ["es.promise.finally"]
        //     modernPolyfills: true,
        // }),
        // babel({
        //     babelHelpers: 'bundled',
        //     exclude: 'node_modules/**',
        //     presets: [
        //         [
        //             '@babel/preset-env',
        //             {
        //                 useBuiltIns: 'entry',
        //                 corejs: 3,
        //                 targets: {
        //                     edge: '17',
        //                     firefox: '60',
        //                     chrome: '67',
        //                     safari: '11.1',
        //                 },
        //             },
        //         ],
        //     ],
        // }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    },
    //TODO 设置资源根路径，默认为  '/'  导致只能在根目录下访问。  修改为 './'  即可访问相对路径。
    base: './',
    build: {
        // cssCodeSplit: true, // 启用 CSS 代码拆分
        // terserOptions: {
        //     compress: {
        //         keep_infinity: true,
        //         // 解决在低版本浏览器中 CSS 被压缩为单行导致渲染问题的 bug
        //         drop_console: true,
        //     },
        // },
        // rollupOptions: {
        //     plugins: [],
        // },
        target: "es2015"
    },
    css: {
        postcss: {
            plugins: [PostCssPresetEnv(),autoprefixer()],
        },
    },
})
