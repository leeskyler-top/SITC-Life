import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// import Components from 'unplugin-vue-components/vite';
// import { AntDesignVueResolver } from 'unplugin-vue-components/resolvers';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
      vue(),
    // Components({
    //   resolvers: [AntDesignVueResolver()],
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  //TODO 设置资源根路径，默认为  '/'  导致只能在根目录下访问。  修改为 './'  即可访问相对路径。
  base:'./'
})
