import ChapterHeader from "../ui/ChapterHeader";
import Section from "../ui/Section";

const ChapterOne = () => {
  return (
    <Section>
      <ChapterHeader.Root>
        <ChapterHeader.Label>Capítulo 1</ChapterHeader.Label>
        <ChapterHeader.Title>Lorem Ipsum</ChapterHeader.Title>
        <ChapterHeader.Subtitle>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem ipsum
          dolor sit amet, consectetur adipiscing elit. Lorem ipsum dolor sit
          amet, consectetur adipiscing elit. Lorem ipsum dolor sit amet,
          consectetur adipiscing elit. Lorem ipsum dolor sit amet, consectetur
          adipiscing elit. Lorem ipsum dolor sit amet, consectetur adipiscing
          elit. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Lorem
          ipsum dolor sit amet, consectetur adipiscing elit.
        </ChapterHeader.Subtitle>
      </ChapterHeader.Root>
    </Section>
  );
};

export default ChapterOne;
