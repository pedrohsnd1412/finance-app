import { useResponsive } from '@/components/useResponsive';
import { DesktopLayout } from './DesktopLayout';
import { MobileLayout } from './MobileLayout';

export function AppLayout() {
    const { isDesktop } = useResponsive();

    if (isDesktop) {
        return <DesktopLayout />;
    }

    return <MobileLayout />;
}
