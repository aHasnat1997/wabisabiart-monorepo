import { getProductById, getProductReviews } from "../../components/action";
import { notFound } from "next/navigation";
import ProductDetailsClient from "../components/ProductDetailsClient";

interface Props {
  params: { id: string };
  searchParams: { variantId?: string };
}

export default async function ProductDetailsPage({
  params,
  searchParams,
}: Props) {
  const { id } = await params;
  const res = await getProductById(id);
  const data = res?.data;
  const reviews = await getProductReviews(id);

  if (!data) notFound();

  return (
    <div>
      <ProductDetailsClient
        data={data}
        variantId={searchParams.variantId ?? null}
        reviews={reviews}
      />
    </div>
  );
}
