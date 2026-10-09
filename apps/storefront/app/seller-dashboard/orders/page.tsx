import { Suspense } from "react";
import AllOrders from "./components/AllOrders";



export default function Orders () {

    return (
        <div>
            <Suspense fallback={null}>
                <AllOrders></AllOrders>
            </Suspense>
        </div>
    )
}