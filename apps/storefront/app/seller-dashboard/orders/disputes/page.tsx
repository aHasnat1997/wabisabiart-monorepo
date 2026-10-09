
import { Suspense } from 'react';
import StatCardList from '../../components/CardList';

import DisputesData from './components/DisputesData';
import { getOrderStats } from '../components/OrderAction';
import { buildOrderStats } from '../components/OrderStatsConfig';

const Disputes = async () => {

   const stats = await getOrderStats();
  const ordersStats = buildOrderStats(stats);


  return (
    <div>

        <div>
        <StatCardList dtitle="Disputes" description="Manage order disputes and resolutions" items={ordersStats} />
      </div>

     <Suspense fallback={null}>
       <DisputesData></DisputesData>
     </Suspense>
    </div>
  )
}

export default Disputes;