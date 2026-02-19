import { ReactNode } from "react";
import { useMembership } from "@/hooks/use-membership";
import { useNostr } from "@/contexts/nostr-context";
import { Lock } from "lucide-react";
import { getTierInfo, type MembershipTier } from "@/lib/membership";

interface MembershipGateProps {
  feature: 'progress' | 'comments' | 'tribes' | 'vault' | 'loveBoard' | 'magicMentor' | 'createTribes' | 'createExperiments' | 'createEvents' | 'analytics';
  children: ReactNode;
  fallback?: ReactNode;
  showLock?: boolean;
}

const FEATURE_REQUIREMENTS: Record<string, { minTier: MembershipTier; label: string }> = {
  progress: { minTier: 'core', label: 'Progress Tracking' },
  comments: { minTier: 'core', label: 'Comments' },
  tribes: { minTier: 'core', label: 'Tribes' },
  vault: { minTier: 'core', label: 'Vault' },
  loveBoard: { minTier: 'core', label: 'Love Board' },
  magicMentor: { minTier: 'core', label: 'Magic Mentor AI' },
  createTribes: { minTier: 'core_annual', label: 'Create Tribes' },
  createExperiments: { minTier: 'creator', label: 'Create Experiments' },
  createEvents: { minTier: 'creator', label: 'Create Events' },
  analytics: { minTier: 'creator', label: 'Analytics Dashboard' },
};

function hasAccess(feature: string, permissions: ReturnType<typeof useMembership>['permissions'], isAdmin: boolean): boolean {
  if (isAdmin) return true;

  switch (feature) {
    case 'progress': return permissions.canTrackProgress;
    case 'comments': return permissions.canComment;
    case 'tribes': return permissions.canTrackProgress;
    case 'vault': return permissions.canUseVault;
    case 'loveBoard': return permissions.canTrackProgress;
    case 'magicMentor': return permissions.canUseMagicMentor;
    case 'createTribes': return permissions.canCreateTribes;
    case 'createExperiments': return permissions.canCreate;
    case 'createEvents': return permissions.canCreateEvents;
    case 'analytics': return permissions.canCreate;
    default: return false;
  }
}

export function MembershipGate({ feature, children, fallback, showLock = true }: MembershipGateProps) {
  const { isConnected } = useNostr();
  const { permissions, isAdmin, isLoggedIn } = useMembership();

  if (!isConnected || !isLoggedIn) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  if (hasAccess(feature, permissions, isAdmin)) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  if (!showLock) return null;

  const requirement = FEATURE_REQUIREMENTS[feature];
  const requiredTierInfo = getTierInfo(requirement?.minTier || 'core');

  return (
    <div className="flex items-center gap-2 p-3 rounded-xs border border-dashed" style={{ borderColor: '#6600ff33' }} data-testid={`gate-${feature}`}>
      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">
          {requirement?.label} requires {requiredTierInfo.name} ({requiredTierInfo.price})
        </p>
      </div>
    </div>
  );
}

export function MembershipBadge() {
  const { tierInfo, isLoggedIn } = useMembership();

  if (!isLoggedIn) return null;

  return (
    <span
      className="text-xs px-2 py-0.5 rounded-xs"
      style={{ color: tierInfo.color, backgroundColor: tierInfo.color + '15' }}
      data-testid="badge-membership-tier"
    >
      {tierInfo.name}
    </span>
  );
}
