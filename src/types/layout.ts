export type ThemeMode = 'light' | 'blue';

export interface SidebarState {
  readonly isExpanded: boolean;
  readonly isMobileOpen: boolean;
  readonly isHovered: boolean;
}

export const SIDEBAR_EXPANDED_WIDTH = 256;
export const SIDEBAR_COLLAPSED_WIDTH = 80;
