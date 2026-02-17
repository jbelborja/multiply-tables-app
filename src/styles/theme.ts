export const theme = {
    colors: {
        primary: '#4F46E5', // Indigo
        primaryDark: '#4338CA',
        secondary: '#7C3AED', // Violet
        success: '#10B981', // Emerald
        error: '#EF4444', // Red
        warning: '#F59E0B', // Amber
        background: '#F9FAFB',
        surface: '#FFFFFF',
        text: '#111827',
        textSecondary: '#4B5563',
        textLight: '#9CA3AF',
        border: '#E5E7EB',
        white: '#FFFFFF',
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
    },
    roundness: {
        sm: 4,
        md: 8,
        lg: 12,
        xl: 20,
        full: 9999,
    },
    typography: {
        h1: {
            fontSize: 32,
            fontWeight: '800' as const,
        },
        h2: {
            fontSize: 24,
            fontWeight: '700' as const,
        },
        h3: {
            fontSize: 18,
            fontWeight: '600' as const,
        },
        body: {
            fontSize: 16,
            fontWeight: '400' as const,
        },
        caption: {
            fontSize: 14,
            fontWeight: '400' as const,
        },
    },
    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 6,
            elevation: 4,
        },
    }
};
