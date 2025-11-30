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
    theme: "Manifesting Monday",
    icon: Zap,
    color: "text-yellow-400",
    bg: "bg-yellow-400/10",
    spotifyId: "37i9dQZF1DX1lVhptIYRda", // Motivation placeholder
    description: "High energy beats to manifest abundance."
  },
  {
    day: "Tuesday",
    theme: "Transformational Tuesday",
    icon: Sunrise,
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    spotifyId: "37i9dQZF1DX4sWSpwq3LiO", // Peaceful piano placeholder
    description: "Embrace the power of change and evolution."
  },
  {
    day: "Wednesday",
    theme: "Wonder-Filled Wednesday",
    icon: Star,
    color: "text-indigo-500",
    bg: "bg-indigo-500/10",
    spotifyId: "37i9dQZF1DX843Qf4lr8fU", // Power hits placeholder
    description: "Stay curious and embrace the magic around you."
  },
  {
    day: "Thursday",
    theme: "Thankful Thursday",
    icon: Heart,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
    spotifyId: "37i9dQZF1DXdpQPPZq3F7n", // Gratitude/Morning acoustic
    description: "Gentle rhythms for a grateful heart."
  },
  {
    day: "Friday",
    theme: "Funk-Yeah Friday",
    icon: Music,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    spotifyId: "37i9dQZF1DX0SM0LYsmbMT", // Jazz/Chill placeholder
    description: "Groove into the weekend with these funky jams."
  },
  {
    day: "Saturday",
    theme: "Sexy Saturday",
    icon: Moon,
    color: "text-pink-600",
    bg: "bg-pink-600/10",
    spotifyId: "37i9dQZF1DWZqd5JICZI0u", // Lo-fi beats
    description: "Embrace your sensuality and self-love."
  }
];

export const getPlaylistForToday = () => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayIndex = new Date().getDay();
  return DAILY_PLAYLISTS[todayIndex];
};
