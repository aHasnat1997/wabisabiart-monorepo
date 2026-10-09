"use client"
import SectionTitle from '@/components/SectionTitle'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useEffect, useState } from "react";
import { JournalListItem } from '@/types/journal';
import { BlogCard } from '../blog/components/BlogCard';
import { getAllJournals } from '../blog/components/action';



const Journal = () => {
  const [journals, setJournals] = useState<JournalListItem[]>([]);

  useEffect(() => {
    const fetchJournals = async () => {
      try {
        const response = await getAllJournals(1, 4);

        const journalData = response?.data || response || [];
        setJournals(journalData);
      } catch (error) {
        console.error("Error fetching journals:", error);
      } finally {
      }
    };

    fetchJournals();
  }, []);

  if (journals.length === 0) {
    return null;
  }

  return (
    <section className="mt-20">
      {/* SECTION HEADER WITH EXTERNAL CONTROLS */}
      <SectionTitle
        title="WabiSabi Journal"
        button={
          <Link href="/blog">
            <Button className="rounded-full" variant={"outline"}>
              Explore All Stories
            </Button>
          </Link>
        }
      />

      {/* CARDS GRID */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-10">
        {journals.map((item) => (
          <BlogCard key={item.id} journal={item} />
        ))}
      </div>
    </section>
  );
};

export default Journal;