import { apiFetch } from "@/lib/apiFetch";
import { Customer } from "./CusromerDirectory";


export const getCustomersList = async (page: number = 1, limit: number = 10) => {
    try {
        // Construct query string for pagination
        const query = new URLSearchParams({
            page: page.toString(),
            limit: limit.toString(),
        });

        const response = await apiFetch<{
            success: boolean; 
            data: Customer[];
            meta: { totalPages: number; totalData: number; page: number } 
        }>(`/customers/seller?${query.toString()}`, { method: "GET" });
        
        return response;
    } catch (error) {
        console.error("Failed to fetch customers:", error);
        throw error;
    }
}