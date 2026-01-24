import Layout from "@/components/layout";
import { MasterpieceDashboard } from "@/components/dashboard/masterpiece-dashboard";

export default function Home() {
  return (
    <Layout>
      <div className="absolute inset-0 md:left-0 bg-background overflow-hidden">
        <MasterpieceDashboard />
      </div>
    </Layout>
  );
}
