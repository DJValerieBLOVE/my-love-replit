import Layout from "@/components/layout";
import { MasterpieceDashboard } from "@/components/dashboard/masterpiece-dashboard";

export default function Home() {
  return (
    <Layout>
      <div className="fixed inset-0 top-16 left-0 md:left-64 bg-background">
        <MasterpieceDashboard />
      </div>
    </Layout>
  );
}
