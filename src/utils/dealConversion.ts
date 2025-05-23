
import { Deal } from "@/services/dealsService";
import { DealSummary } from "@/types/deal";

export const convertDealToDealSummary = (deal: Deal): DealSummary => {
  return {
    id: deal.id,
    title: deal.title,
    status: deal.status as any, // Cast to match DealSummary status type
    createdAt: new Date(deal.created_at),
    updatedAt: new Date(deal.updated_at),
    healthScore: deal.health_score,
    sellerId: deal.seller_id,
    buyerId: deal.buyer_id,
    sellerName: deal.seller?.name || "",
    buyerName: deal.buyer?.name || "",
    businessName: deal.business_name || deal.title,
    businessIndustry: deal.business_industry,
    targetCompletionDate: deal.target_completion_date ? new Date(deal.target_completion_date) : undefined
  };
};

export const convertDealsToDealSummaries = (deals: Deal[]): DealSummary[] => {
  return deals.map(convertDealToDealSummary);
};
