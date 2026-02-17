import * as RNWeb from 'react-native-web';

// Mock missing exports for libraries like react-native-screens
export const TurboModuleRegistry = {
    get: () => null,
    getEnforcing: () => null,
};

export const UnsafeLifecycle_canary_ignored_warnings = [];

// Re-export everything from react-native-web
export * from 'react-native-web';

// Default export (not usually a function in RN)
export default {
    ...RNWeb,
    TurboModuleRegistry,
    UnsafeLifecycle_canary_ignored_warnings
};
