
import PendingShipment from './components/PendingShipment';
import StatCardList from '../../components/CardList';

import { Suspense } from 'react';
import { getOrderStats } from '../components/OrderAction';
import { buildOrderStats } from '../components/OrderStatsConfig';

const PendingShipmentPage =async () => {

   const stats = await getOrderStats();
  const ordersStats = buildOrderStats(stats);
  return (
    <div>

        <div>
            <div>
        <StatCardList dtitle="Pending Shipment" description="Orders ready to be shipped" items={ordersStats} />
      </div>
        </div>

        <Suspense fallback={null}>
          <PendingShipment></PendingShipment>
        </Suspense>
    </div>
  )
}

export default PendingShipmentPage;