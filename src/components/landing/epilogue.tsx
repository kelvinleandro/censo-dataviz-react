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
          Os dados do Censo 2022 revelam um país em profunda transição
          demográfica e social. A pirâmide etária, antes caracterizada por uma
          base larga de jovens, cede espaço para um envelhecimento acelerado,
          exigindo uma reavaliação urgente de nossas estruturas de saúde e
          previdência.
        </p>

        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-12">
          Ao analisar o Brasil, raça e educação, a desigualdade torna-se visível
          no mapa. No entanto, este retrato também marca um momento histórico de
          reconhecimento, tirando da invisibilidade estatística as populações
          indígenas e quilombolas. O Brasil que emerge dos números é complexo e
          diferente: uma sociedade que, apesar da diversidade, tem ainda muitas
          contradições a lidar.
        </p>
      </div>
    </Section>
  );
};

export default Epilogue;
