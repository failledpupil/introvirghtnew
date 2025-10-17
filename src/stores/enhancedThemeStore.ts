// DEPRECATED: This file is kept for backward compatibility
// Use unifiedThemeStore instead

import { useUnifiedThemeStore, initializeUnifiedTheme } from './unifiedThemeStore';

// Re-export unified theme store
export const useEnhancedThemeStore = useUnifiedThemeStore;

// Re-export initialization function
export const initializeEnhancedTheme = initializeUnifiedTheme;

export default useEnhancedThemeStore;
