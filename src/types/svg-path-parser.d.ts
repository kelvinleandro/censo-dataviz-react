declare module 'svg-path-parser' {
  const parseSVG: (d: string) => any[];
  export default parseSVG;
  export function parseSVG(d: string): any[];
}