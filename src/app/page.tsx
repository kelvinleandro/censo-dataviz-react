import ChapterOne from "@/components/landing/chapter-01";
import ChapterFour from "@/components/landing/chapter-04";
import Hero from "@/components/landing/hero";

const Home = () => {
  return (
    <div className="bg-background min-h-screen">
      <Hero />
      <ChapterOne />
      <ChapterFour />
    </div>
  );
};

export default Home;
