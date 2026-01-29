import Layout from "@/components/layout";
import { ProsperityPyramid } from "@/components/dashboard/prosperity-pyramid";

export default function Home() {
  return (
    <Layout>
      <div className="w-full h-full bg-background overflow-hidden">
        <ProsperityPyramid />
      </div>
    </Layout>
  );
}
