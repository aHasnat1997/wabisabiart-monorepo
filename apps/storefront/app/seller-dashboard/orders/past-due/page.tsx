import React, { Suspense } from 'react'
import PastDueData from './components/PastDueData';
import StatCardList from '../../components/CardList';

import { getOrderStats } from '../components/OrderAction';
import { buildOrderStats } from '../components/OrderStatsConfig';

const PastDue = async() => {

   const stats = await getOrderStats();
  const ordersStats = buildOrderStats(stats);
  return (
    <div>

        <div>
        <StatCardList dtitle="Past Due Orders" description="Orders that require immediate attention" items={ordersStats} />
      </div>
           

       <Suspense fallback={null}>
         <PastDueData></PastDueData>
       </Suspense>
    </div>
  )
}

export default PastDue;