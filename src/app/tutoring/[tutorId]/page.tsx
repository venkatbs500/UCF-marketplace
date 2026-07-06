import { TutorDetailView } from "@/components/tutoring/tutor-detail-view";

export default async function TutorDetailPage({
  params,
}: {
  params: Promise<{ tutorId: string }>;
}) {
  const { tutorId } = await params;
  return <TutorDetailView tutorId={tutorId} />;
}
