import { useMemo } from 'react';
import { useNostr } from '@/contexts/nostr-context';
import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/lib/api';
import {
  ADMIN_PUBKEY,
  getTierPermissions,
  getTierInfo,
  type MembershipTier,
  type MembershipPermissions,
  type TierInfo,
} from '@/lib/membership';

interface UseMembershipResult {
  tier: MembershipTier;
  permissions: MembershipPermissions;
  tierInfo: TierInfo;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isCreator: boolean;
  isPaidMember: boolean;
  canCreate: boolean;
  canUseVault: boolean;
  canComment: boolean;
  canUseMagicMentor: boolean;
  isBYOK: boolean;
  isLoading: boolean;
}

function useMembership(): UseMembershipResult {
  const { isConnected, profile } = useNostr();

  const { data: user, isLoading } = useQuery({
    queryKey: ['currentUser', profile?.pubkey],
    queryFn: getCurrentUser,
    enabled: isConnected && !!profile,
    staleTime: 60_000,
  });

  const result = useMemo(() => {
    if (!isConnected || !profile) {
      return {
        tier: 'free' as MembershipTier,
        permissions: getTierPermissions('free'),
        tierInfo: getTierInfo('free'),
        isLoggedIn: false,
        isAdmin: false,
        isCreator: false,
        isPaidMember: false,
        canCreate: false,
        canUseVault: false,
        canComment: false,
        canUseMagicMentor: false,
        isBYOK: false,
        isLoading: false,
      };
    }

    if (profile.pubkey === ADMIN_PUBKEY) {
      const adminPerms = getTierPermissions('creator');
      return {
        tier: 'creator' as MembershipTier,
        permissions: { ...adminPerms, canAdmin: true },
        tierInfo: { name: 'Admin', price: '', color: '#6600ff', description: 'Full access' },
        isLoggedIn: true,
        isAdmin: true,
        isCreator: true,
        isPaidMember: true,
        canCreate: true,
        canUseVault: true,
        canComment: true,
        canUseMagicMentor: true,
        isBYOK: false,
        isLoading: false,
      };
    }

    const dbTier = user?.tier || 'free';

    let tier: MembershipTier = 'free';
    if (dbTier === 'byok' || dbTier === 'creator_byok') {
      tier = 'creator_byok';
    } else if (dbTier === 'creator_annual') {
      tier = 'creator_annual';
    } else if (dbTier === 'creator') {
      tier = 'creator';
    } else if (dbTier === 'core_annual') {
      tier = 'core_annual';
    } else if (dbTier === 'core' || dbTier === 'paid') {
      tier = 'core';
    } else {
      tier = 'free';
    }

    const permissions = getTierPermissions(tier);

    return {
      tier,
      permissions,
      tierInfo: getTierInfo(tier),
      isLoggedIn: true,
      isAdmin: false,
      isCreator: tier === 'creator' || tier === 'creator_annual' || tier === 'creator_byok',
      isPaidMember: tier !== 'free',
      canCreate: permissions.canCreate,
      canUseVault: permissions.canUseVault,
      canComment: permissions.canComment,
      canUseMagicMentor: permissions.canUseMagicMentor,
      isBYOK: tier === 'creator_byok',
      isLoading,
    };
  }, [isConnected, profile, user, isLoading]);

  return result;
}

function useCanCreate(): boolean {
  const { canCreate } = useMembership();
  return canCreate;
}

function useCanUseVault(): boolean {
  const { canUseVault } = useMembership();
  return canUseVault;
}

function useCanComment(): boolean {
  const { canComment } = useMembership();
  return canComment;
}

export { useMembership, useCanCreate, useCanUseVault, useCanComment };
export type { UseMembershipResult };
