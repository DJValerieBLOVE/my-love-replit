import Layout from "@/components/layout";
import { HeartDashboard } from "@/components/dashboard/heart-dashboard";

export default function Home() {
  return (
    <Layout>
      <div className="w-full h-full bg-background overflow-hidden">
        <HeartDashboard />
      </div>
    </Layout>
  );
}
