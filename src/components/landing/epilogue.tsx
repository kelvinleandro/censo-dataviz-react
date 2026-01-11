import Section from "../ui/Section";
import ChapterHeader from "../ui/ChapterHeader";

const Epilogue = () => {
  return (
    <Section>
      <ChapterHeader.Root>
        <ChapterHeader.Label>Epílogo</ChapterHeader.Label>
        <ChapterHeader.Title>O Brasil que Emerge</ChapterHeader.Title>
      </ChapterHeader.Root>

      <div className="lg:max-w-3/4 mx-auto max-w-4/5 lg:w-full space-y-6">
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit. Lorem, ipsum dolor sit
          amet consectetur adipisicing elit. Nobis blanditiis incidunt sed non
          ducimus excepturi consectetur dignissimos neque voluptatibus natus
          voluptatem veritatis, saepe sint perspiciatis nam alias fugit quasi
          debitis.
        </p>

        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit. Lorem, ipsum dolor sit
          amet consectetur adipisicing elit. Nobis blanditiis incidunt sed non
          ducimus excepturi consectetur dignissimos neque voluptatibus natus
          voluptatem veritatis, saepe sint perspiciatis nam alias fugit quasi
          debitis.
        </p>
      </div>
    </Section>
  );
};

export default Epilogue;
