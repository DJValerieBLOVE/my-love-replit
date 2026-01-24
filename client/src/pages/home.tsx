import Layout from "@/components/layout";
import { MasterpieceDashboard } from "@/components/dashboard/masterpiece-dashboard";

export default function Home() {
  return (
    <Layout>
      <div className="w-full h-full bg-background overflow-hidden">
        <MasterpieceDashboard />
      </div>
    </Layout>
  );
}
