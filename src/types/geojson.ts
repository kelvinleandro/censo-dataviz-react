interface Geometry {
  type: string;
  coordinates: number[][][][];
}

interface Properties {
  id: number;
  name: string;
  sigla: string;
}

interface Feature {
  type: string;
  geometry: Geometry;
  properties: Properties;
  [key: string]: unknown;
}

export interface GeoJson {
  type: string;
  features: Feature[];
}
