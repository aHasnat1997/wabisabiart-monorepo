import  { Suspense } from 'react'
import StatCardList from '../../components/CardList';

import RefundRequestData from './components/RefundRequestData';
import { getOrderStats } from '../components/OrderAction';
import { buildOrderStats } from '../components/OrderStatsConfig';

const RefundRequest = async() => {

   const stats = await getOrderStats();
  const ordersStats = buildOrderStats(stats);

  return (
    <div>
         <div>
        <StatCardList dtitle="Refund Request" description="Review and process customer refund requests" items={ordersStats} />
      </div>

     <Suspense fallback={null}>
       <RefundRequestData></RefundRequestData>
     </Suspense>

    </div>
  )
}

export default RefundRequest;