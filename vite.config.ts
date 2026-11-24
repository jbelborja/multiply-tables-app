import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [react()],
    resolve: {
        alias: [
            { find: 'react-native-safe-area-context', replacement: path.resolve(__dirname, 'src/mocks/safe-area-context.jsx') },
            { find: 'react-native-screens', replacement: path.resolve(__dirname, 'src/mocks/react-native-screens.jsx') },
            { find: 'react-native/Libraries/Utilities/codegenNativeComponent', replacement: path.resolve(__dirname, 'src/mocks/codegenNativeComponent.js') },
            { find: 'react-native/Libraries/Utilities/codegenNativeCommands', replacement: path.resolve(__dirname, 'src/mocks/codegenNativeCommands.js') },
            { find: 'react-native/Libraries/ReactNative/AppContainer', replacement: path.resolve(__dirname, 'src/mocks/AppContainer.jsx') },
            { find: /^react-native$/, replacement: path.resolve(__dirname, 'src/mocks/react-native-composite.jsx') },
            { find: /^react-native\/.*/, replacement: path.resolve(__dirname, 'src/mocks/react-native-composite.jsx') },
        ],
    },
    define: {
        global: 'window',
        __DEV__: JSON.stringify(false),
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
})
