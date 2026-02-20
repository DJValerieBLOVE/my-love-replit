import Layout from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Home, 
  Target, 
  Lightbulb, 
  Calendar, 
  Users, 
  BookOpen, 
  Sparkles,
  Zap,
  Radio,
  Heart,
  Flame
} from "lucide-react";

const sections = [
  {
    title: "Getting Started",
    icon: Home,
    items: [
      {
        title: "Your Dashboard",
        description: "The home screen shows 9 flip cards representing different areas of your life. Tap any card to see more details, or tap 'Details' to dive deeper."
      },
      {
        title: "Daily LOVE Practice",
        description: "This is the heart of the app. Every day, reflect on the 5 V's: Vibe (how you feel), Vision (what you're focused on), Value (gratitude), Villain (obstacles), and Victory (wins)."
      },
      {
        title: "Building Streaks",
        description: "Complete your Daily LOVE Practice consistently to build streaks. The longer your streak, the more you'll grow!"
      }
    ]
  },
  {
    title: "The 11x LOVE Code",
    icon: Heart,
    items: [
      {
        title: "11 Life Areas",
        description: "The 11x LOVE Code covers: GOD/LOVE, Romance, Family, Community, Mission, Money, Time, Environment, Body, Mind, and Soul. Rate yourself 1-11 in each area."
      },
      {
        title: "Big Dreams",
        description: "Set your biggest dreams in each of the 11 areas. These become your north stars for personal growth."
      },
      {
        title: "Progress Tracking",
        description: "The colorful equalizer shows your progress across all 11 areas. Watch it grow as you work on yourself!"
      }
    ]
  },
  {
    title: "Learning & Growth",
    icon: Lightbulb,
    items: [
      {
        title: "Courses & Experiments",
        description: "Take courses designed to help you grow in specific areas. Run experiments to test new habits and behaviors."
      },
      {
        title: "Resources Library",
        description: "Access Lab Notes, your personal Vault, and curated Music & Meditations to support your journey."
      }
    ]
  },
  {
    title: "Community & Events",
    icon: Users,
    items: [
      {
        title: "Joining Communities",
        description: "Connect with like-minded people in communities. Some are open, others require approval or membership."
      },
      {
        title: "Events Calendar",
        description: "Find virtual and in-person events. Join workshops, meditation sessions, and community gatherings."
      },
      {
        title: "Buddies & Accountability",
        description: "Partner with accountability buddies who support your growth journey and keep you on track."
      }
    ]
  },
  {
    title: "Magic Mentor AI",
    icon: Sparkles,
    items: [
      {
        title: "Your Personal Coach",
        description: "The Magic Mentor (purple sparkles button) is your AI coach. It learns from your journal entries and goals to provide personalized guidance."
      },
      {
        title: "Ask Anything",
        description: "Get advice, brainstorm ideas, process emotions, or just chat. The more you share, the better it knows you."
      }
    ]
  },
  {
    title: "Bitcoin & Lightning",
    icon: Zap,
    items: [
      {
        title: "Earning Sats",
        description: "Earn Bitcoin (sats) for completing practices, hitting milestones, and contributing to the community."
      },
      {
        title: "Sending Zaps",
        description: "Show appreciation by zapping (sending sats to) other members. It's value-for-value!"
      },
      {
        title: "Wallet Setup",
        description: "Connect your Lightning wallet using Nostr Wallet Connect (NWC) for seamless payments."
      }
    ]
  },
  {
    title: "Nostr & Privacy",
    icon: Radio,
    items: [
      {
        title: "Your Keys, Your Identity",
        description: "Your Nostr keys are your identity. Never share your private key (nsec). Your public key (npub) is safe to share."
      },
      {
        title: "Managing Relays",
        description: "Relays store and distribute your data. You can customize which relays you use in Settings > Relays."
      },
      {
        title: "Privacy Controls",
        description: "Choose what to share: keep entries private, share with your community, or publish to all of Nostr."
      }
    ]
  }
];

export default function HowToUse() {
  return (
    <Layout>
      <div className="w-full h-full overflow-y-auto pb-20 md:pb-4">
        <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-2xl md:text-3xl font-serif font-normal text-foreground mb-2" data-testid="text-how-to-use-title">
              How to Use My Masterpiece
            </h1>
            <p className="text-muted-foreground" data-testid="text-how-to-use-subtitle">
              Your guide to designing a life you LOVE
            </p>
          </div>

          {sections.map((section) => (
            <Card key={section.title} className="border-none shadow-sm" data-testid={`card-section-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-3 text-lg" data-testid={`text-section-title-${section.title.toLowerCase().replace(/\s+/g, '-')}`}>
                  <div className="w-8 h-8 rounded-full bg-love-body/10 flex items-center justify-center">
                    <section.icon className="w-4 h-4 text-love-body" />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {section.items.map((item, index) => (
                  <div key={index} className="pl-11" data-testid={`item-${section.title.toLowerCase().replace(/\s+/g, '-')}-${index}`}>
                    <h4 className="font-normal text-foreground mb-1" data-testid={`text-item-title-${section.title.toLowerCase().replace(/\s+/g, '-')}-${index}`}>{item.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-item-desc-${section.title.toLowerCase().replace(/\s+/g, '-')}-${index}`}>{item.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}

          <div className="text-center pt-4 pb-8">
            <p className="text-sm text-muted-foreground">
              Questions? Tap the <Sparkles className="w-4 h-4 inline text-love-body" /> Magic Mentor for help anytime.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
