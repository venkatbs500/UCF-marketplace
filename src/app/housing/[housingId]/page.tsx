import { HousingDetailView } from "@/components/housing/housing-detail-view";

export default async function HousingDetailPage({
  params,
}: {
  params: Promise<{ housingId: string }>;
}) {
  const { housingId } = await params;
  return <HousingDetailView housingId={housingId} />;
}
