import { apiFetch } from "@/lib/apiFetch";
import { ApiShippingRule, ShippingConfig, ShippingConfigResponse, UpdateShippingPayload } from "@/types/sellerDashboard/FreeShippingRules";
import { revalidateMarketting } from "../../components/ServerAction";


export const getGlobalShippingAddress = async ():Promise<ShippingConfig> => {
    try {
        
        const response = await apiFetch<ShippingConfigResponse>("/seller/marketing/free-shipping/config",
         {method:"GET"});
        return response.data;
    
        
    } catch (error) {

        console.error("feild error", error)
        throw error;
        
    }
}


export const updateGlobalShipping = async (payload: UpdateShippingPayload): Promise<ShippingConfigResponse> => {
  try {
    const data = await apiFetch<ShippingConfigResponse>(
      "/seller/marketing/free-shipping/config",
      { 
        method: "PATCH", 
        body: payload 
      }
    );

    await revalidateMarketting();
    return data;
  } catch (error) {
    console.error("Update shipping config error:", error);
    throw error;
  }
};


export const toggleShippingStatus = async (): Promise<ShippingConfigResponse> => {
  try {
    const data = await apiFetch<ShippingConfigResponse>(
      "/seller/marketing/free-shipping/config/toggle",
      { method: "PATCH" }
    );

    await revalidateMarketting();
    return data;
  } catch (error) {
    console.error("Toggle shipping error:", error);
    throw error;
  }
};


export const  getListAllRules = async ():Promise<ApiShippingRule[]> => {
    try {

        const response = await apiFetch<{ success: boolean; data: ApiShippingRule[] }>("/seller/marketing/free-shipping/rules", {method: "GET"});
        return response.data || []
        
    } catch (error) {

        console.error("all rules error", error);
        throw error;
        
    }
}

export interface ShippingStats {
  activeRules: number;
  totalFreeShippingOrders: number;
}

export const getShippingStats = async (): Promise<ShippingStats> => {
  try {
    const response = await apiFetch<{ success: boolean; data: ShippingStats }>(
      "/seller/marketing/free-shipping/stats",
      { method: "GET" }
    );
    return response.data || { activeRules: 0, totalFreeShippingOrders: 0 };
  } catch (error) {
    console.error("Fetch stats error:", error);
    return { activeRules: 0, totalFreeShippingOrders: 0 };
  }
};

export const createShippingRule = async (payload: { name: string, minimumOrderAmount: number, region: string }) => {
  try {
    const response = await apiFetch<{ success: boolean }>("/seller/marketing/free-shipping/rules", {
      method: "POST",
      body: payload,
    });
    await revalidateMarketting();
    return response;
  } catch (error) {
    console.error("Create rule error:", error);
    throw error;
  }
};


export const updateShippingRule = async (
  id: string, 
  payload: { name?: string; minimumOrderAmount?: number; region?: string }
): Promise<{ success: boolean }> => {
  try {
    const data = await apiFetch<{ success: boolean; data: { count: number } }>(
      `/seller/marketing/free-shipping/rules/${id}`,
      { 
        method: "PATCH", 
        body: payload 
      }
    );

    await revalidateMarketting();
    return { success: data.success };
  } catch (error) {
    console.error("Update shipping rule error:", error);
    throw error;
  }
};


export const updateToggleShipping = async (
    id: string ,

): Promise<{ success: boolean}> => {
    try {

          const data = await apiFetch<{ success: boolean; data: { count: number } }>(
      `/seller/marketing/free-shipping/rules/${id}/toggle`,
      { 
        method: "PATCH", 
      }
    );
    await revalidateMarketting();
    return { success: data.success };
    } catch (error) {
    console.error("Update shipping rule error:", error);
    throw error;
    }
}

export const deleteShippingCard = async (id: string): Promise<{ success: boolean }> => {
  try {
    const data = await apiFetch<{ success: boolean }>(
      `/seller/marketing/free-shipping/rules/${id}`, 
      { method: "DELETE" }
    );

    await revalidateMarketting(); 
    return data;
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    throw error;
  }
};