export type PerformanceStatus = "Excellent" | "Good" | "Average"|"Verified";


export type WishlistItem = {
  product: string
  wishlistAdds: number
  purchases: number
  conversion: number // percentage (e.g. 20.4)
  revenue: number
  status: PerformanceStatus
}



export type TopProductItem = {
  product: string
  sold: number
  revenue: number
  status: PerformanceStatus
}