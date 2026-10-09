import { apiFetch } from "@/lib/apiFetch";
import { PromotionStats } from "@/types/sellerDashboard/Marketting";
import { revalidateMarketting } from "./ServerAction";
import { BackendPromotion, PromotionItem } from "@/types/sellerDashboard/PromotionItems";


//  get promotion

export const  getPromotionStats = async (): Promise<PromotionStats> => {

    try {
        const data = await apiFetch<{ success: boolean; data: PromotionStats }>
        ("/seller/marketing/promotions/overview", { method : "GET" });
        return data.data;
        
    } catch (error) {
        console.error("Error fetching product stats:", error);
    throw error;
    }

}

// create promotion

export const createPromotion = async (payload: object) => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      "/seller/marketing/promotions",
      { method: "POST", body: payload }  
    );

    // console.log("data", data); 
    await revalidateMarketting();
    return data;

  } catch (error) {
    console.error("Create promotion error:", error);
    throw error;
  }
};






export const getAllPromotions = async (): Promise<PromotionItem[]> => {
  try {
    const response = await apiFetch<{ success: boolean; data: BackendPromotion[] }>(
      "/seller/marketing/promotions",
      { method: "GET"} 
    );

    if (!response?.data) return [];

    
 const formattedPromotions: PromotionItem[] = response.data.map((promo) => {
  const start = new Date(promo.startDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const end = promo.endDate ? new Date(promo.endDate).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }) : "Ongoing";
  
  
  let displayType: "Percentage" | "Fixed" | "BOGO" = "Percentage";
  let displayValue = "";

  if (promo.discountType === "FIXED") {
    displayType = "Fixed";
    displayValue = `$${promo.discountValue}`;
  } else if (promo.discountType === "BOGO") {
    displayType = "BOGO";
    displayValue = "Buy One Get One"; 
  } else {
    displayType = "Percentage";
    displayValue = `${promo.discountValue}%`;
  }

  const formattedApplyTo = promo.applyTo.split("_").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ");

  return {
    id: promo.id,
    title: promo.name,
    type: displayType, 
    value: displayValue, 
    status: promo.isActive ? "Active" : "Inactive",
    appliedTo: [formattedApplyTo],
    uses: promo.usageCount || 0,
    revenue: "$0",
    period: `${start} - ${end}`,
  };
});

    return formattedPromotions;
  } catch (error) {
    console.error("Error fetching all promotions:", error);
    return []; 
  }
};


export const getAllPromotionById = async (id: string) => {
  try {
    
    const response = await apiFetch<{ success: boolean; data: BackendPromotion }>(`/seller/marketing/promotions/${id}`, { method: "GET" });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch promotion", error);
    throw error;
  }
}

export const updatePromotion = async (id: string, payload: object) => {

try {

    const data = apiFetch<{ success: boolean }>(`/seller/marketing/promotions/${id}`,
    {method:"PATCH", body: payload})
    await revalidateMarketting();
    return data;
    
} catch (error) {
    console.error("Update promotion error:", error);
    throw error;
  }
    
}

export const togglePromotionStatus = async (id: string) => {
  try {
    const response = await apiFetch<{ success: boolean; data: BackendPromotion }>(
      `/seller/marketing/promotions/${id}/toggle`,
      { method: "PATCH" }
    );

    await revalidateMarketting(); 
    
    return response;
  } catch (error) {
    console.error("Toggle promotion error:", error);
    throw error;
  }
};


export const deletePromotion = async (id: string) => {

    try {
        const response = await apiFetch<{ success: boolean; data: BackendPromotion }>(
            `/seller/marketing/promotions/${id}`,
            { method: "DELETE" }
        );
        await revalidateMarketting();

        return response;
        
    } catch (error) {
        console.error("Toggle promotion error:", error);
    throw error;
    }

}