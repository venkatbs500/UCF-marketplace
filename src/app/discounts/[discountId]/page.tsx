import { StudentDiscountDetailView } from "@/components/discounts/student-discount-detail-view";

export default async function StudentDiscountDetailPage({
  params,
}: {
  params: Promise<{ discountId: string }>;
}) {
  const { discountId } = await params;
  return <StudentDiscountDetailView discountId={discountId} />;
}
