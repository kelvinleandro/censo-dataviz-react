# Censo 2022

## GeoJSON utilizado para renderização do mapa do Brasil

https://raw.githubusercontent.com/codeforamerica/click_that_hood/master/public/data/brazil-states.geojson

### Malhas municipais que podem ser utilizadas

https://www.ibge.gov.br/geociencias/organizacao-do-territorio/malhas-territoriais/15774-malhas.html (Brasil -> Unidades da Federação também disponibiliza arquivos para a geração de mapa do Brasil)

## Tabelas que serão utilizadas

- [Alfabetização por Sexo, Raça e Grupo de Idade](https://basedosdados.org/dataset/08a1546e-251f-4546-9fe0-b1e6ab2b203d?table=cf9537b5-6198-455f-a8b0-7c762e94d79c)
- [Índice de Envelhecimento por Raça](https://basedosdados.org/dataset/08a1546e-251f-4546-9fe0-b1e6ab2b203d?table=db8e8000-6dac-4b76-989c-38e44f3a6359)
- [Município](https://basedosdados.org/dataset/08a1546e-251f-4546-9fe0-b1e6ab2b203d?table=707fd42e-95e0-4856-922f-fcbb55db913a)
- [População por Grupo de Idade, Sexo e Raça](https://basedosdados.org/dataset/08a1546e-251f-4546-9fe0-b1e6ab2b203d?table=4a374dd0-3a67-4383-a72b-9d5017e286e9)
- [População por Grupo de Idade e UF](https://basedosdados.org/dataset/08a1546e-251f-4546-9fe0-b1e6ab2b203d?table=ebd0f0fd-73f1-4295-848a-52666ad31757)
- [População por Idade e Sexo](https://basedosdados.org/dataset/08a1546e-251f-4546-9fe0-b1e6ab2b203d?table=a886aa3c-cfe3-4885-a40c-54dab2f0cdd0)

## Criação das Tabelas

```sql
CREATE TABLE populacao_grupo_idade_sexo_raca (
    ano            INTEGER,
    id_municipio   VARCHAR(20),
    grupo_idade    VARCHAR(50),
    sexo           VARCHAR(10),
    cor_raca       VARCHAR(20),
    populacao      BIGINT
);

CREATE TABLE populacao_idade_sexo (
    id_municipio               VARCHAR(20),
    forma_declaracao_idade     VARCHAR(50),
    sexo                       VARCHAR(10),
    idade                      VARCHAR(20),
    idade_anos                 NUMERIC(10,2),
    grupo_idade                VARCHAR(50),
    populacao                  BIGINT
);


CREATE TABLE diretorios_brasil_municipio (
    id_municipio                  INTEGER,
    id_municipio_6                INTEGER,
    id_municipio_tse              NUMERIC,
    id_municipio_rf               NUMERIC,
    id_municipio_bcb              NUMERIC,
    nome                          VARCHAR(200),
    capital_uf                    NUMERIC,
    id_comarca                    NUMERIC,
    id_regiao_saude               NUMERIC,
    nome_regiao_saude             VARCHAR(200),
    id_regiao_imediata            INTEGER,
    nome_regiao_imediata          VARCHAR(200),
    id_regiao_intermediaria       INTEGER,
    nome_regiao_intermediaria     VARCHAR(200),
    id_microrregiao               NUMERIC,
    nome_microrregiao             VARCHAR(200),
    id_mesorregiao                NUMERIC,
    nome_mesorregiao              VARCHAR(200),
    id_regiao_metropolitana       VARCHAR(200),
    nome_regiao_metropolitana     VARCHAR(200),
    ddd                           NUMERIC,
    id_uf                         INTEGER,
    sigla_uf                      VARCHAR(5),
    nome_uf                       VARCHAR(200),
    nome_regiao                   VARCHAR(200),
    amazonia_legal                INTEGER,
    centroide                     VARCHAR(200)
);

CREATE TABLE alfabetizacao_grupo_idade_sexo_raca (
    id_municipio   INTEGER,
    cor_raca       VARCHAR(20),
    sexo           VARCHAR(10),
    grupo_idade    VARCHAR(50),
    alfabetizacao  VARCHAR(20),
    populacao      NUMERIC
);

CREATE TABLE indice_envelhecimento_raca (
    ano                     INTEGER,
    id_municipio            INTEGER,
    cor_raca                VARCHAR(20),
    indice_envelhecimento   NUMERIC,
    idade_mediana           NUMERIC,
    razao_sexo              NUMERIC
);

CREATE TABLE municipio (
    id_municipio                               INTEGER,
    sigla_uf                                    VARCHAR(5),
    domicilios                                  BIGINT,
    populacao                                   BIGINT,
    area                                        NUMERIC,
    taxa_alfabetizacao                          NUMERIC,
    idade_mediana                               INTEGER,
    razao_sexo                                  NUMERIC,
    indice_envelhecimento                       NUMERIC,
    populacao_indigena                          BIGINT,
    populacao_indigena_terra_indigena           BIGINT,
    populacao_quilombola                        BIGINT,
    populacao_quilombola_territorio_quilombola  BIGINT
);

CREATE TABLE populacao_grupo_idade_uf (
    sigla_uf      VARCHAR(5),
    grupo_idade   VARCHAR(50),
    populacao     NUMERIC
);

```
