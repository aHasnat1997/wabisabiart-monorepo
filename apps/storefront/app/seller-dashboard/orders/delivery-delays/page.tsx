import  { Suspense } from 'react'
import StatCardList from '../../components/CardList';
import DeliveryDelaysData from './components/DeliveryDelaysData';
import { getOrderStats } from '../components/OrderAction';
import { buildOrderStats } from '../components/OrderStatsConfig';

const DeliveyDelaysPage = async () => {
  const stats = await getOrderStats();
const ordersStats = buildOrderStats(stats);


  return (
    <div>
        
    <div>
        <StatCardList dtitle="Delivery Delays" description="Track delayed shipments and notify customers" items={ordersStats} />
      </div>

       <Suspense fallback={null}>
      <DeliveryDelaysData />
    </Suspense>


    </div>
  )
}

export default DeliveyDelaysPage;