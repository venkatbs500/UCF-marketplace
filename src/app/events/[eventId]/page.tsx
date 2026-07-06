import { CampusEventDetailView } from "@/components/events/campus-event-detail-view";

export default async function CampusEventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return <CampusEventDetailView eventId={eventId} />;
}
