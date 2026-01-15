import { Pool } from "pg";
import fs from "fs";
import path from "path";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
    ca: process.env.DATABASE_CA_CERTIFICATE,
  },
});

const QUERIES = {
  age_color_proportion: `WITH base AS (
     SELECT
         cor_raca,
         CASE
             WHEN grupo_idade IN ('0 a 4 anos','5 a 9 anos','10 a 14 anos')
                 THEN 'Jovens (0-14)'
             WHEN grupo_idade IN (
                 '15 a 19 anos','20 a 24 anos','25 a 29 anos',
                 '30 a 34 anos','35 a 39 anos','40 a 44 anos',
                 '45 a 49 anos','50 a 54 anos','55 a 59 anos'
             ) THEN 'Adultos (15-59)'
             ELSE 'Idosos (60+)'
         END AS ciclo_vida,
         SUM(populacao) AS pop
     FROM populacao_grupo_idade_sexo_raca
     WHERE ano = 2022
     GROUP BY cor_raca, ciclo_vida
 ),
 totais AS (
     SELECT cor_raca, SUM(pop) AS total
     FROM base
     GROUP BY cor_raca
 )
 SELECT
     b.cor_raca,
     b.ciclo_vida,
     ROUND((b.pop * 100.0 / t.total)::numeric, 2) AS percentual
 FROM base b
 JOIN totais t USING (cor_raca)
 ORDER BY cor_raca, ciclo_vida;`,

  aging_index_by_race: `WITH base AS (
     SELECT
         cor_raca,
         CASE
             WHEN grupo_idade IN (
                 '0 a 4 anos', '5 a 9 anos', '10 a 14 anos'
             ) THEN 'jovem'
             WHEN grupo_idade IN (
                 '60 a 64 anos', '65 a 69 anos', '70 a 74 anos',
                 '75 a 79 anos', '80 a 84 anos', '85 a 89 anos',
                 '90 a 94 anos', '95 a 99 anos', '100 anos ou mais'
             ) THEN 'idoso'
         END AS faixa,
         SUM(populacao) AS pop
     FROM populacao_grupo_idade_sexo_raca
     WHERE ano = 2022
     GROUP BY cor_raca, faixa
 )
 SELECT
     cor_raca,
     ROUND(
         (
             SUM(CASE WHEN faixa = 'idoso' THEN pop END)
             /
             NULLIF(SUM(CASE WHEN faixa = 'jovem' THEN pop END), 0)
             * 100
         )::numeric
     , 2) AS indice_envelhecimento
 FROM base
 GROUP BY cor_raca
 ORDER BY indice_envelhecimento DESC;`,

  aging_index_vs_literacy_by_color: `WITH envelhecimento AS (
     SELECT
         cor_raca,
         SUM(CASE
             WHEN grupo_idade IN (
                 '60 a 64 anos','65 a 69 anos','70 a 74 anos',
                 '75 a 79 anos','80 a 84 anos','85 a 89 anos',
                 '90 a 94 anos','95 a 99 anos','100 anos ou mais'
             ) THEN populacao ELSE 0 END
         )::numeric
         /
         NULLIF(
             SUM(CASE
                 WHEN grupo_idade IN ('0 a 4 anos','5 a 9 anos','10 a 14 anos')
                 THEN populacao ELSE 0 END
             ), 0
         ) * 100 AS indice_envelhecimento
     FROM populacao_grupo_idade_sexo_raca
     WHERE ano = 2022
     GROUP BY cor_raca
 ),
 alfabetizacao AS (
     SELECT
         cor_raca,
         SUM(CASE WHEN alfabetizacao = 'Alfabetizadas' THEN populacao ELSE 0 END)
         * 100.0 / SUM(populacao) AS taxa_alfabetizacao
     FROM alfabetizacao_grupo_idade_sexo_raca
     GROUP BY cor_raca
 )
 SELECT
     e.cor_raca,
     ROUND(e.indice_envelhecimento::numeric, 2) AS indice_envelhecimento,
     ROUND(a.taxa_alfabetizacao::numeric, 2) AS taxa_alfabetizacao
 FROM envelhecimento e
 JOIN alfabetizacao a USING (cor_raca)
 ORDER BY indice_envelhecimento DESC;`,

  aging_index_vs_race: `SELECT cor_raca, ROUND(AVG(indice_envelhecimento)::numeric, 2) AS indice
 FROM indice_envelhecimento_raca
 WHERE ano = 2022
 GROUP BY cor_raca;`,

  aging_population_by_state: `SELECT
       d.nome_uf,
       ROUND(AVG(i.idade_mediana)::numeric, 1) AS idade_mediana_media
      FROM indice_envelhecimento_raca i
      JOIN diretorios_brasil_municipio d ON i.id_municipio = d.id_municipio
      WHERE i.ano = 2022
      GROUP BY d.nome_uf
      ORDER BY idade_mediana_media DESC;`,

  indigenous_population_by_state: `SELECT
     d.nome_uf,
     SUM(m.populacao_indigena) AS total,
     ROUND(SUM(m.populacao_indigena) / SUM(m.populacao) * 100.0, 2) AS porcentagem
 FROM municipio m
 JOIN diretorios_brasil_municipio d ON m.id_municipio = d.id_municipio
 GROUP BY d.nome_uf
 ORDER BY d.nome_uf;`,

  literacy_by_age_group: `SELECT
     grupo_idade,
     ROUND(
         (
             SUM(CASE WHEN alfabetizacao = 'Alfabetizadas' THEN populacao ELSE 0 END)
             * 100
             / SUM(populacao)
         )::numeric,
         2
     ) AS taxa_alfabetizacao
 FROM alfabetizacao_grupo_idade_sexo_raca
 GROUP BY grupo_idade
 ORDER BY grupo_idade;`,

  literacy_by_sex: `SELECT
     sexo,
     ROUND(
       (
         SUM(CASE WHEN alfabetizacao = 'Alfabetizadas' THEN populacao ELSE 0 END) * 100
         / SUM(populacao)
       )::numeric,
       2
     ) AS taxa_percentual
 FROM alfabetizacao_grupo_idade_sexo_raca
 GROUP BY sexo;`,

  literacy_rate_by_race: `SELECT
     cor_raca,
     ROUND(
         (
             SUM(CASE WHEN alfabetizacao = 'Alfabetizadas' THEN populacao ELSE 0 END)
             * 100
             / SUM(populacao)
         )::numeric,
         2
     ) AS taxa_alfabetizacao
 FROM alfabetizacao_grupo_idade_sexo_raca
 GROUP BY cor_raca
 ORDER BY cor_raca;`,

  median_age_by_race: `SELECT cor_raca, ROUND(AVG(idade_mediana)::numeric, 2) AS idade_med
 FROM indice_envelhecimento_raca
 WHERE ano = 2022
 GROUP BY cor_raca;`,

  median_age_vs_literacy_by_state: `SELECT d.nome_uf,
        d.nome_regiao,
        ROUND(AVG(i.idade_mediana)::numeric, 2) AS idade_mediana,
        ROUND(AVG(m.taxa_alfabetizacao)::numeric, 2) AS taxa_alfabetizacao
 FROM indice_envelhecimento_raca i
 JOIN diretorios_brasil_municipio d USING(id_municipio)
 JOIN municipio m USING(id_municipio)
 WHERE i.ano = 2022
 GROUP BY d.nome_uf, d.nome_regiao
 ORDER BY d.nome_uf;`,

  population_by_age_group_2010: `SELECT
     CASE
         WHEN idade_num <= 10 THEN '0 a 14 anos'
         WHEN idade_num <= 20 THEN '15 a 24 anos'
         WHEN idade_num <= 30 THEN '25 a 34 anos'
         WHEN idade_num <= 40 THEN '35 a 44 anos'
         WHEN idade_num <= 50 THEN '45 a 54 anos'
         WHEN idade_num <= 60 THEN '55 a 64 anos'
         WHEN idade_num <= 70 THEN '65 a 74 anos'
         ELSE '75 anos ou mais'
     END AS idade_grupo,
     SUM(populacao) AS total
 FROM (
     SELECT
         populacao,
         idade_inicial AS idade_num
     FROM populacao_grupo_idade_sexo_raca
     WHERE ano = 2010
 ) sub
 GROUP BY idade_grupo
 ORDER BY MIN(idade_num);`,
  population_by_age_group_2022: `SELECT
     CASE
         WHEN idade_num <= 10 THEN '0 a 14 anos'
         WHEN idade_num <= 20 THEN '15 a 24 anos'
         WHEN idade_num <= 30 THEN '25 a 34 anos'
         WHEN idade_num <= 40 THEN '35 a 44 anos'
         WHEN idade_num <= 50 THEN '45 a 54 anos'
         WHEN idade_num <= 60 THEN '55 a 64 anos'
         WHEN idade_num <= 70 THEN '65 a 74 anos'
         ELSE '75 anos ou mais'
     END AS idade_grupo,
     SUM(populacao) AS total
 FROM (
     SELECT
         populacao,
         idade_inicial AS idade_num
     FROM populacao_grupo_idade_sexo_raca
     WHERE ano = 2022
 ) sub
 GROUP BY idade_grupo
 ORDER BY MIN(idade_num);`,

  population_by_race: `SELECT
     cor_raca,
     SUM(populacao) as total,
     ROUND(
         (
             SUM(populacao) * 100
             / (
                 SELECT SUM(populacao)
                 FROM populacao_grupo_idade_sexo_raca
                 WHERE ano = 2022
             )
         )::numeric,
         2
     ) AS porcentagem
 FROM populacao_grupo_idade_sexo_raca
 WHERE ano = 2022
 GROUP BY cor_raca
 ORDER BY cor_raca;`,

  population_distribution_by_sex: `WITH base AS (
   SELECT
     sexo,
     CASE
       WHEN sexo = 'Homens' THEN populacao
       ELSE -populacao
     END AS populacao,
     idade_inicial AS idade
   FROM populacao_grupo_idade_sexo_raca
   WHERE ano = 2022
 )
 SELECT
   CASE
     WHEN idade < 15 THEN '0 a 14 anos'
     WHEN idade < 25 THEN '15 a 24 anos'
     WHEN idade < 35 THEN '25 a 34 anos'
     WHEN idade < 45 THEN '35 a 44 anos'
     WHEN idade < 55 THEN '45 a 54 anos'
     WHEN idade < 65 THEN '55 a 64 anos'
     WHEN idade < 75 THEN '65 a 74 anos'
     ELSE '75 anos ou mais'
   END AS idade_grupo,
   sexo,
   SUM(populacao) AS total
 FROM base
 GROUP BY idade_grupo, sexo
 ORDER BY MIN(idade), sexo;`,

  population_distribution_by_state: `WITH dados_agrupados AS (
     SELECT
         nome_uf,
         idade_grupo,
         SUM(populacao) AS total,
         -- Mantendo o identificador numérico para ordenar corretamente depois
         MIN(idade_num) AS ordem_idade
     FROM (
         SELECT
             d.nome_uf,
             p.populacao,
             CASE
                 WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 15 THEN '0 a 14 anos'
                 WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 25 THEN '15 a 24 anos'
                 WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 35 THEN '25 a 34 anos'
                 WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 45 THEN '35 a 44 anos'
                 WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 55 THEN '45 a 54 anos'
                 WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 65 THEN '55 a 64 anos'
                 WHEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER) < 75 THEN '65 a 74 anos'
                 ELSE '75 anos ou mais'
             END AS idade_grupo,
             CASE
                 WHEN p.grupo_idade ~ '^[0-9]'
                 THEN CAST(regexp_replace(p.grupo_idade, '(^\\d+).*', '\\1') AS INTEGER)
                 ELSE 999
             END AS idade_num
         FROM populacao_grupo_idade_uf p
         LEFT JOIN (SELECT DISTINCT sigla_uf, nome_uf FROM diretorios_brasil_municipio) d
           USING(sigla_uf)
         WHERE p.grupo_idade ~ '^[0-9]'
     ) sub
     GROUP BY nome_uf, idade_grupo
 )

 SELECT
     nome_uf,
     idade_grupo,
     total AS populacao_grupo,
     SUM(total) OVER(PARTITION BY nome_uf) AS populacao_estado,
     ROUND(
         (
             total * 100
             / SUM(total) OVER (PARTITION BY nome_uf)
         )::numeric,
         2
     ) AS proporcao
 FROM dados_agrupados
 ORDER BY nome_uf, ordem_idade;`,

  quilombola_population_by_state: `SELECT
     d.nome_uf,
     SUM(m.populacao_quilombola) AS total,
     ROUND(SUM(m.populacao_quilombola) / SUM(m.populacao) * 100.0, 2) AS porcentagem
 FROM municipio m
 JOIN diretorios_brasil_municipio d ON m.id_municipio = d.id_municipio
 GROUP BY d.nome_uf
 ORDER BY d.nome_uf;`,

  race_distribution_by_age_group: `SELECT
     idade_grupo,
     cor_raca,
     SUM(populacao) AS total,
     ROUND(
         (
             SUM(populacao) * 100
             / SUM(SUM(populacao)) OVER (PARTITION BY idade_grupo)
         )::numeric,
         2
     ) AS porcentagem_na_idade
 FROM (
     SELECT
         cor_raca,
         populacao,
         CASE
             WHEN grupo_idade ~ '^[0-9]' THEN
                 CASE
                     WHEN idade_num < 15 THEN '0 a 14 anos'
                     WHEN idade_num < 25 THEN '15 a 24 anos'
                     WHEN idade_num < 35 THEN '25 a 34 anos'
                     WHEN idade_num < 45 THEN '35 a 44 anos'
                     WHEN idade_num < 55 THEN '45 a 54 anos'
                     WHEN idade_num < 65 THEN '55 a 64 anos'
                     WHEN idade_num < 75 THEN '65 a 74 anos'
                     ELSE '75 anos ou mais'
                 END
             ELSE 'Idade ignorada'
         END AS idade_grupo,
         idade_num
     FROM (
         SELECT
             cor_raca,
             populacao,
             grupo_idade,
             CAST(substring(grupo_idade FROM '^\\d+') AS INTEGER) AS idade_num
         FROM populacao_grupo_idade_sexo_raca
         WHERE ano = 2022
           AND grupo_idade ~ '^[0-9]'
     ) t
 ) sub
 GROUP BY idade_grupo, cor_raca
 ORDER BY idade_grupo, cor_raca;`,

  state_diversity: `WITH populacao_por_estado AS (
     SELECT
         d.nome_uf,
         SUM(p.populacao) AS total_estado
     FROM populacao_grupo_idade_sexo_raca p
     JOIN diretorios_brasil_municipio d
         ON p.id_municipio = d.id_municipio::bigint
     GROUP BY d.nome_uf
 )
 SELECT
     d.nome_uf,
     p.cor_raca,
     SUM(p.populacao) AS total,
     ROUND(
         (
             SUM(p.populacao) * 100
             / pe.total_estado
         )::numeric,
         2
     ) AS porcentagem
 FROM populacao_grupo_idade_sexo_raca p
 JOIN diretorios_brasil_municipio d
     ON p.id_municipio = d.id_municipio::bigint
 JOIN populacao_por_estado pe
     ON pe.nome_uf = d.nome_uf
 GROUP BY d.nome_uf, p.cor_raca, pe.total_estado
 ORDER BY d.nome_uf, p.cor_raca;`,

  territories_vs_residents: `SELECT
     d.nome_uf,
     SUM(m.populacao_indigena_terra_indigena)::int AS em_terra_indigena,
     SUM(m.populacao_indigena)::int AS total_indigena,
     SUM(m.populacao_quilombola)::int AS total_quilombola,
     SUM(m.populacao_quilombola_territorio_quilombola)::int as em_terra_quilombola
 FROM municipio m
 JOIN diretorios_brasil_municipio d ON m.id_municipio = d.id_municipio
 GROUP BY d.nome_uf
 ORDER BY d.nome_uf;`,
};

async function run() {
  const outputDir = path.join(process.cwd(), "csv_exports");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  for (const [name, sql] of Object.entries(QUERIES)) {
    console.log(`Exporting ${name}...`);
    // check if file already exists
    // const filePath = path.join(outputDir, `${name}.csv`);
    // if (fs.existsSync(filePath)) {
    //   console.log(`  File already exists, skipping`);
    //   continue;
    // }
    try {
      const res = await pool.query(sql);
      if (res.rows.length === 0) {
        console.log(`  No data for ${name}`);
        continue;
      }

      const keys = Object.keys(res.rows[0]);
      const csvLines = [keys.join(",")];

      for (const row of res.rows) {
        const values = keys.map((k) => {
          const val = row[k];
          if (val === null || val === undefined) return "";
          const str = String(val);
          // Escaping simples para CSV
          if (str.includes(",") || str.includes('"') || str.includes("\n")) {
            return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
        });
        csvLines.push(values.join(","));
      }

      fs.writeFileSync(
        path.join(outputDir, `${name}.csv`),
        csvLines.join("\n")
      );
      console.log(`  Saved ${name}.csv`);
    } catch (err) {
      console.error(`  Error exporting ${name}:`, err);
    }
  }

  await pool.end();
}

run();
