import { type FeatureCollection, type Geometry, type Feature } from "geojson";

export interface BrazilStateProperties {
  id: number;
  name: string;
  sigla: string;
}

export interface BrazilStateFeature
  extends Feature<Geometry, BrazilStateProperties> {
  value?: number;
}

export interface BrazilGeoJson
  extends FeatureCollection<Geometry, BrazilStateProperties> {
  features: BrazilStateFeature[];
}
