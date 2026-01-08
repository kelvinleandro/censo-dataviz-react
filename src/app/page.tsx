import ChapterOne from "@/components/landing/chapter-01";
import ChapterFour from "@/components/landing/chapter-04";
import ChapterTwo from "@/components/landing/chapter-02";
import Hero from "@/components/landing/hero";
import ChapterFive from "@/components/landing/chapter-05";
const Home = () => {
  return (
    <div className="bg-background min-h-screen">
      <Hero />
      {/*<ChapterOne />*/}
      <ChapterTwo/>
      <ChapterFour />
      <ChapterFive/>
    </div>
  );
};

export default Home;
