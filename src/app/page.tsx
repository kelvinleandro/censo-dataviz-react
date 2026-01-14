import ChapterOne from "@/components/landing/chapter-01";
import ChapterTwo from "@/components/landing/chapter-02";
import ChapterThree from "@/components/landing/chapter-03";
import ChapterFour from "@/components/landing/chapter-04";
import ChapterFive from "@/components/landing/chapter-05";
import ChapterSix from "@/components/landing/chapter-06";
import Epilogue from "@/components/landing/epilogue";
import Hero from "@/components/landing/hero";

const Home = () => {
  return (
    <div className="bg-background min-h-screen">
      <Hero />
      <ChapterOne />
      <ChapterTwo />
      <ChapterThree />
      <ChapterFour />
      <ChapterFive />
      <ChapterSix />
      <Epilogue />
    </div>
  );
};

export default Home;
