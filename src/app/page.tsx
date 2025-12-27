import ChapterOne from "@/components/landing/chapter-01";
import Hero from "@/components/landing/hero";
const Home = () => {
  return (
    <div className="bg-background min-h-screen">
      <Hero/>
      <ChapterOne />
    </div>
  );
};

export default Home;
