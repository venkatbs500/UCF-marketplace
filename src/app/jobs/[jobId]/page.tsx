import { CampusJobDetailView } from "@/components/jobs/campus-job-detail-view";

export default async function CampusJobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  return <CampusJobDetailView jobId={jobId} />;
}
