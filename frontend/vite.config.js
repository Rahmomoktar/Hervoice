import {defineConfig} from 'vite';

// Keep browser requests on the frontend's origin even when Vite selects another port.
const proxy = {'/api': {target: 'http://127.0.0.1:5000', changeOrigin: true}};
export default defineConfig({
  server: {proxy},
  preview: {proxy}
});
