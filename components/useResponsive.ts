import { useWindowDimensions } from 'react-native';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export const BREAKPOINTS = {
  TABLET: 768,
  DESKTOP: 1024,
};

export function useResponsive() {
  const { width } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.TABLET;
  const isTablet = width >= BREAKPOINTS.TABLET && width < BREAKPOINTS.DESKTOP;
  const isDesktop = width >= BREAKPOINTS.DESKTOP;

  let deviceType: DeviceType = 'mobile';
  if (isTablet) deviceType = 'tablet';
  if (isDesktop) deviceType = 'desktop';

  return {
    deviceType,
    isMobile,
    isTablet,
    isDesktop,
    width,
    // Helper to conditionally return values based on device type
    select: <T>(values: { mobile?: T; tablet?: T; desktop?: T; default?: T }) => {
      if (isDesktop && values.desktop !== undefined) return values.desktop;
      if (isTablet && values.tablet !== undefined) return values.tablet;
      if (isMobile && values.mobile !== undefined) return values.mobile;
      return values.default;
    },
  };
}
