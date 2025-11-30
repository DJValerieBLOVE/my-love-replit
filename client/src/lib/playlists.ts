import { 
  Music, 
  Sunrise, 
  Sun, 
  Sunset, 
  Moon, 
  Star, 
  Zap, 
  Heart 
} from "lucide-react";

export const DAILY_PLAYLISTS = [
  {
    day: "Sunday",
    theme: "Soulful Sunday",
    icon: Sun,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    spotifyId: "37i9dQZF1DX0Yxoavh5qJV", // Gospel/Soul placeholder
    description: "Recharge your spirit with these soulful tunes."
  },
  {
    day: "Monday",
    theme: "Magic Money Monday",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    spotifyId: "37i9dQZF1DX1lVhptIYRda", // Motivation placeholder
    description: "High energy beats to manifest abundance."
  },
  {
    day: "Tuesday",
    theme: "Transformation Tuesday",
    icon: Sunrise,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    spotifyId: "37i9dQZF1DX4sWSpwq3LiO", // Peaceful piano placeholder
    description: "Embrace change with flowing melodies."
  },
  {
    day: "Wednesday",
    theme: "Wild Woman Wednesday",
    icon: Heart,
    color: "text-red-500",
    bg: "bg-red-500/10",
    spotifyId: "37i9dQZF1DX843Qf4lr8fU", // Power hits placeholder
    description: "Unleash your inner power."
  },
  {
    day: "Thursday",
    theme: "Thankful Thursday",
    icon: Star,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    spotifyId: "37i9dQZF1DXdpQPPZq3F7n", // Gratitude/Morning acoustic
    description: "Gentle rhythms for a grateful heart."
  },
  {
    day: "Friday",
    theme: "Freedom Friday",
    icon: Music,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    spotifyId: "37i9dQZF1DX0SM0LYsmbMT", // Jazz/Chill placeholder
    description: "Celebrate your wins and slide into the weekend."
  },
  {
    day: "Saturday",
    theme: "Self-Love Saturday",
    icon: Moon,
    color: "text-pink-500",
    bg: "bg-pink-500/10",
    spotifyId: "37i9dQZF1DWZqd5JICZI0u", // Lo-fi beats
    description: "Nourish your soul with these loving vibes."
  }
];

export const getPlaylistForToday = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayIndex = new Date().getDay();
  return DAILY_PLAYLISTS[todayIndex];
};
