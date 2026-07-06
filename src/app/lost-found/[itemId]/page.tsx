import { LostFoundDetailView } from "@/components/lost-found/lost-found-detail-view";

export default async function LostFoundDetailPage({
  params,
}: {
  params: Promise<{ itemId: string }>;
}) {
  const { itemId } = await params;
  return <LostFoundDetailView itemId={itemId} />;
}
