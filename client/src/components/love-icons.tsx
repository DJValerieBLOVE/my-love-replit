import React from "react";

export interface LoveIconProps {
  size?: number;
  variant?: "outline" | "filled" | "circle" | "white" | "black" | "gradient";
  className?: string;
}

const LoveIcon: React.FC<LoveIconProps & { color?: string }> = ({
  size = 24,
  variant = "outline",
  color = "#000",
  className = "",
}) => {
  if (variant === "white") {
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
          stroke="white"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "black") {
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
          stroke="black"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === "gradient") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className={className}
      >
        <defs>
          <linearGradient
            id="rainbowGradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#eb00a8" />
            <stop offset="14%" stopColor="#e60023" />
            <stop offset="28%" stopColor="#ff6600" />
            <stop offset="42%" stopColor="#ffdf00" />
            <stop offset="56%" stopColor="#00d81c" />
            <stop offset="70%" stopColor="#00ccff" />
            <stop offset="84%" stopColor="#6600ff" />
            <stop offset="100%" stopColor="#cc00ff" />
          </linearGradient>
        </defs>
        <path
          d="M16 8L22 14L19 22H13L10 14L16 8Z"
          fill="url(#rainbowGradient)"
          stroke="url(#rainbowGradient)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

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

// Brand colors matching EQ visualizer
const BRAND_COLORS = {
  "god-love": "#eb00a8",
  romance: "#e60023",
  family: "#ff6600",
  community: "#ffdf00",
  mission: "#a2f005",
  money: "#00d81c",
  time: "#00ccff",
  environment: "#0033ff",
  body: "#6600ff",
  mind: "#9900ff",
  soul: "#cc00ff",
};

export const GodLoveLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS["god-love"]} />
);

export const RomanceLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.romance} />
);

export const FamilyLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.family} />
);

export const CommunityLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.community} />
);

export const MissionLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.mission} />
);

export const MoneyLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.money} />
);

export const TimeLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.time} />
);

export const EnvironmentLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.environment} />
);

export const BodyLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.body} />
);

export const MindLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.mind} />
);

export const SoulLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} color={BRAND_COLORS.soul} />
);

export const RainbowLoveIcon: React.FC<LoveIconProps> = (props) => (
  <LoveIcon {...props} variant="gradient" />
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
