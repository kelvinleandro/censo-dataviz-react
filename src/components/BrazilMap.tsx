"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { geoMercator, geoPath } from "d3-geo";
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import parseSVG from "svg-path-parser";

export default function BrazilMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // --- CONFIGURAÇÃO ---
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    rendererRef.current = renderer;

    const scene = new THREE.Scene();

    const camera = new THREE.OrthographicCamera(
      width / -2, width / 2, height / 2, height / -2, 1, 1000
    );
    camera.position.z = 100;

    const projection = geoMercator()
      .scale(700)
      .center([-54, -15])
      .translate([0, 0]);

    const pathGenerator = geoPath().projection(projection);

    // --- HELPERS ---
    const parseDToMultiPaths = (d: string) => {
      try {
        const commands = parseSVG(d);
        const paths: THREE.Vector3[][] = [];
        let currentPath: THREE.Vector3[] = [];
        commands.forEach((cmd) => {
          if (cmd.code === "M") {
            if (currentPath.length > 0) paths.push(currentPath);
            currentPath = [];
          }
          if (cmd.x !== undefined && cmd.y !== undefined) {
            currentPath.push(new THREE.Vector3(cmd.x, -cmd.y, 0));
          }
        });
        if (currentPath.length > 0) paths.push(currentPath);
        return paths;
      } catch (e) { return []; }
    };

    const getLineLength = (points: THREE.Vector3[]) => {
      let len = 0;
      for (let i = 0; i < points.length - 1; i++) {
        len += points[i].distanceTo(points[i + 1]);
      }
      return len;
    };

    // --- ESTADOS DA ANIMAÇÃO ---
    const ANIM_STATE = {
      DRAWING_WHITE: 0,
      DRAWING_GREEN: 1,
      FADING_TO_WHITE: 2,
      DONE: 3,
    };

    let currentState = ANIM_STATE.DRAWING_WHITE;
    
    interface LinePair {
        white: Line2;
        green: Line2;
        len: number;
        speed: number;
    }
    const animatedLinePairs: LinePair[] = [];

    const init = async () => {
      const response = await fetch("/brazil-states.geojson");
      const geo = await response.json();

      // @ts-ignore
      geo.features.forEach((feature) => {
        const d = pathGenerator(feature);
        if (!d) return;
        const shapeParts = parseDToMultiPaths(d);

        shapeParts.forEach((pts) => {
          if (pts.length < 3) return; 

          const positions: number[] = [];
          pts.forEach((p) => positions.push(p.x, p.y, p.z));
          const lineLength = getLineLength(pts);

          const geometry = new LineGeometry();
          geometry.setPositions(positions);

          // 1. LINHA BRANCA (Fundo Permanente)
          const whiteMat = new LineMaterial({
            color: 0x94a3b8, // Slate-400
            linewidth: 2,
            dashed: true,
            dashSize: lineLength,
            gapSize: lineLength * 2,
            resolution: new THREE.Vector2(width, height),
            opacity: 0.5, // Opacidade final desejada
            transparent: true
          });
          whiteMat.dashOffset = lineLength; // Começa invisível

          const whiteLine = new Line2(geometry, whiteMat);
          whiteLine.computeLineDistances();
          whiteLine.position.z = 0; // Fica atrás
          scene.add(whiteLine);

          // 2. LINHA VERDE (Efeito de passagem)
          const greenMat = new LineMaterial({
            color: 0x34d399, // Emerald-400
            linewidth: 3, // Um pouco mais grosso para cobrir o branco
            dashed: true,
            dashSize: lineLength,
            gapSize: lineLength * 2,
            transparent: true,
            opacity: 1,
            resolution: new THREE.Vector2(width, height),
            depthTest: false,
          });
          greenMat.dashOffset = lineLength; // Começa invisível

          const greenLine = new Line2(geometry, greenMat);
          greenLine.computeLineDistances();
          greenLine.position.z = 1; // Fica na frente
          greenLine.renderOrder = 999;
          greenLine.visible = false; 
          scene.add(greenLine);

          animatedLinePairs.push({
            white: whiteLine,
            green: greenLine,
            len: lineLength,
            speed: lineLength * 0.02, 
          });
        });
      });

      animate();
    };

    const animate = () => {
      if (currentState === ANIM_STATE.DONE) {
         if (rendererRef.current) rendererRef.current.render(scene, camera);
         return; 
      }

      animationRef.current = requestAnimationFrame(animate);
      let allDone = true;

      if (currentState === ANIM_STATE.DRAWING_WHITE) {
        animatedLinePairs.forEach((pair) => {
            if (pair.white.material.dashOffset > 0) {
                pair.white.material.dashOffset -= pair.speed;
                if (pair.white.material.dashOffset < 0) pair.white.material.dashOffset = 0;
                allDone = false;
            }
        });
        if (allDone) {
            currentState = ANIM_STATE.DRAWING_GREEN;
            animatedLinePairs.forEach((pair) => {
                pair.green.visible = true;
                pair.green.material.opacity = 1;
                pair.green.material.dashOffset = pair.len;
            });
            allDone = false; 
        }
      } 
      else if (currentState === ANIM_STATE.DRAWING_GREEN) {
        animatedLinePairs.forEach((pair) => {
            if (pair.green.material.dashOffset > 0) {
                pair.green.material.dashOffset -= pair.speed * 1.5;
                if (pair.green.material.dashOffset < 0) pair.green.material.dashOffset = 0;
                allDone = false;
            }
        });
        if (allDone) currentState = ANIM_STATE.FADING_TO_WHITE;
      }
      else if (currentState === ANIM_STATE.FADING_TO_WHITE) {
        let stillFading = false;
        animatedLinePairs.forEach((pair) => {
            if (pair.green.material.opacity > 0) {
                pair.green.material.opacity -= 0.02; 
                if (pair.green.material.opacity < 0) pair.green.material.opacity = 0;
                stillFading = true;
            }
        });
        
        if (!stillFading) {
            currentState = ANIM_STATE.DONE;
            animatedLinePairs.forEach(p => p.green.visible = false);
        }
      }

      if (rendererRef.current) {
        rendererRef.current.render(scene, camera);
      }
    };

    init();

    return () => {
      cancelAnimationFrame(animationRef.current);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      scene.clear();
    };
  }, []); 

  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center">
      <canvas ref={canvasRef} className="block pointer-events-none" />
    </div>
  );
}