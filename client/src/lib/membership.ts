const ADMIN_PUBKEY = '3d70ec1ea586650a0474d6858454209d222158f4079e8db806f017ef5e30e767';

type MembershipTier = 'free' | 'core' | 'core_annual' | 'creator' | 'creator_annual' | 'creator_byok';

interface MembershipPermissions {
  canView: boolean;
  canTake: boolean;
  canTrackProgress: boolean;
  canUseVault: boolean;
  canComment: boolean;
  canZap: boolean;
  canCreate: boolean;
  canCreateTribes: boolean;
  canCreateEvents: boolean;
  canUseMagicMentor: boolean;
  magicMentorTokens: number;
  canBYOK: boolean;
  canAdmin: boolean;
}

function getTierPermissions(tier: MembershipTier): MembershipPermissions {
  switch (tier) {
    case 'free':
      return {
        canView: true,
        canTake: false,
        canTrackProgress: false,
        canUseVault: false,
        canComment: false,
        canZap: true,
        canCreate: false,
        canCreateTribes: false,
        canCreateEvents: false,
        canUseMagicMentor: false,
        magicMentorTokens: 0,
        canBYOK: false,
        canAdmin: false,
      };

    case 'core':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: false,
        canCreateTribes: false,
        canCreateEvents: false,
        canUseMagicMentor: true,
        magicMentorTokens: 2_000_000,
        canBYOK: false,
        canAdmin: false,
      };

    case 'core_annual':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: false,
        canCreateTribes: true,
        canCreateEvents: false,
        canUseMagicMentor: true,
        magicMentorTokens: 2_000_000,
        canBYOK: false,
        canAdmin: false,
      };

    case 'creator':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: true,
        canCreateTribes: true,
        canCreateEvents: true,
        canUseMagicMentor: true,
        magicMentorTokens: 10_000_000,
        canBYOK: false,
        canAdmin: false,
      };

    case 'creator_annual':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: true,
        canCreateTribes: true,
        canCreateEvents: true,
        canUseMagicMentor: true,
        magicMentorTokens: 10_000_000,
        canBYOK: false,
        canAdmin: false,
      };

    case 'creator_byok':
      return {
        canView: true,
        canTake: true,
        canTrackProgress: true,
        canUseVault: true,
        canComment: true,
        canZap: true,
        canCreate: true,
        canCreateTribes: true,
        canCreateEvents: true,
        canUseMagicMentor: true,
        magicMentorTokens: -1,
        canBYOK: true,
        canAdmin: false,
      };

    default:
      return getTierPermissions('free');
  }
}

interface TierInfo {
  name: string;
  price: string;
  color: string;
  description: string;
}

function getTierInfo(tier: MembershipTier): TierInfo {
  switch (tier) {
    case 'free':
      return { name: 'Free', price: '$0', color: '#888888', description: 'Browse catalog, read experiments, zap and share' };
    case 'core':
      return { name: 'Core', price: '$11/mo', color: '#6600ff', description: 'Progress tracking, comments, Tribes, Vault, Love Board, Magic Mentor (2M tokens)' };
    case 'core_annual':
      return { name: 'Core Annual', price: '$99/yr', color: '#6600ff', description: 'Everything Core + create Tribes' };
    case 'creator':
      return { name: 'Creator', price: '$25/mo', color: '#9900ff', description: 'Create experiments, analytics dashboard (10M tokens)' };
    case 'creator_annual':
      return { name: 'Creator Annual', price: '$199/yr', color: '#9900ff', description: 'Everything Creator + create Tribes' };
    case 'creator_byok':
      return { name: 'Creator BYOK', price: '$11/mo', color: '#cc00ff', description: 'Uses your OWN API key — unlimited AI' };
    default:
      return getTierInfo('free');
  }
}

const ALL_TIERS: MembershipTier[] = ['free', 'core', 'core_annual', 'creator', 'creator_annual', 'creator_byok'];

export {
  ADMIN_PUBKEY,
  ALL_TIERS,
  getTierPermissions,
  getTierInfo,
};

export type {
  MembershipTier,
  MembershipPermissions,
  TierInfo,
};
