import { Eye, Inbox } from 'lucide-react';
import StatCardList from '../components/CardList';
import JournalsCard from './components/JournalsCard';
import { getJournalPostStats } from './components/JournalAction';
import SectionTitle from '@/components/SectionTitle';

export const dynamic = "force-dynamic";

const Journals = async () => {
 
  let stats = null;

  try {
    stats = await getJournalPostStats();
  } catch (error) {
    console.error("Failed to fetch journal stats:", error);
    
  }

  const hasData = stats && (
    (stats.totalPublishedPosts ?? 0) > 0 ||
    (stats.totalViews ?? 0) > 0 ||
    (stats.totalLikes ?? 0) > 0 ||
    (stats.totalComments ?? 0) > 0
  );

  const journals = [
    {
      id: 1,
      ctitle: "Total Posts",
      value: typeof stats?.totalPublishedPosts === "number" ? stats.totalPublishedPosts : 0,
      icon: <Eye className="w-4 h-4" />,
      color: "bg-chart-4/65 text-card",
      textColor: "bg-card text-muted-foreground",
    },
    {
      id: 2,
      ctitle: "Total Views",
      value: typeof stats?.totalViews === "number" ? stats.totalViews : 0,
      icon: <Eye className="w-4 h-4" />,
      color: "bg-chart-1/65 text-card",
      textColor: "bg-card text-chart-1",
    },
    {
      id: 3,
      ctitle: "Total Likes",
      value: typeof stats?.totalLikes === "number" ? stats.totalLikes : 0,
      icon: <Eye className="w-4 h-4" />,
      color: "bg-chart-6/65 text-card",
      textColor: "bg-card text-chart-2",
    },
    {
      id: 4,
      ctitle: "Total Comments",
      value: typeof stats?.totalComments === "number" ? stats.totalComments : 0,
      icon: <Eye className="w-4 h-4" />,
      color: "bg-ring text-card",
      textColor: "bg-card text-muted-foreground",
    },
  ];

  return (
    <div>
      <div>
        <SectionTitle title="Shop Journals" subtitle="Share your craft story and connect with customers" />
      </div>

      {hasData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 mb-6 gap-4 w-full">
          {journals.map((journal) => (
            <StatCardList
              key={journal.id}
              ctitle={journal.ctitle}
              value={journal.value}
              icon={journal.icon}
              color={journal.color}
              textColor={journal.textColor}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 mb-6 border-2 border-dashed rounded-xl bg-muted/20">
          <Inbox className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-lg font-medium text-foreground">No stats to show yet</h3>
          <p className="text-sm text-muted-foreground mt-1 text-center max-w-sm">
            Publish your first journal post to start seeing your views, likes, and comments here.
          </p>
        </div>
      )}

      <div>
        <JournalsCard />
      </div>
    </div>
  );
}

export default Journals;