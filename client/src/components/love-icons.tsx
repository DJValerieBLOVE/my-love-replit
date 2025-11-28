import React from "react";

export interface LoveIconProps {
  size?: number;
  variant?: "outline" | "filled" | "circle";
  className?: string;
}

const LoveIcon: React.FC<LoveIconProps & { color: string }> = ({
  size = 24,
  variant = "outline",
  color,
  className = "",
}) => {
  if (variant === "circle") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 40 40"
        fill="none"
        className={className}
      >
        <circle cx="20" cy="20" r="19" fill={color} />
        <path
          d="M20 10L26 16L23 23H17L14 16L20 10Z"
          fill="white"
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    );
  }

  if (variant === "filled") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className={className}
      >
        <rect width="32" height="32" fill={color} rx="4" />
        <path
          d="M16 8L22 14L19 22H13L10 14L16 8Z"
          fill="white"
          stroke="white"
          strokeWidth="1"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
    >
      <path
        d="M16 8L22 14L19 22H13L10 14L16 8Z"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export const GodLoveLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#eb00a8" />
);

export const RomanceLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#e60023" />
);

export const FamilyLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#ff6600" />
);

export const CommunityLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#ffdf00" />
);

export const MissionLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#a2f005" />
);

export const MoneyLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#00d81c" />
);

export const TimeLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#00ccff" />
);

export const EnvironmentLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#0033ff" />
);

export const BodyLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#6600ff" />
);

export const MindLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#9900ff" />
);

export const SoulLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color="#cc00ff" />
);

// Icon map for easy access by area ID
export const LOVE_ICONS = {
  "god-love": GodLoveLoveIcon,
  romance: RomanceLoveIcon,
  family: FamilyLoveIcon,
  community: CommunityLoveIcon,
  mission: MissionLoveIcon,
  money: MoneyLoveIcon,
  time: TimeLoveIcon,
  environment: EnvironmentLoveIcon,
  body: BodyLoveIcon,
  mind: MindLoveIcon,
  soul: SoulLoveIcon,
};

export const getLoveIcon = (areaId: string) => {
  return LOVE_ICONS[areaId as keyof typeof LOVE_ICONS] || GodLoveLoveIcon;
};
