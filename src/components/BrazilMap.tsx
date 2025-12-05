"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { geoMercator, geoPath } from "d3-geo";
// No Next.js, importar de examples geralmente funciona assim, 
// mas se der erro de tipo, avise-me.
import { Line2 } from "three/examples/jsm/lines/Line2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";
import parseSVG from "svg-path-parser";

export default function BrazilMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    // --- SETUP ---
    const canvas = canvasRef.current;
    // Captura o tamanho do container pai para ser responsivo
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true, // Importante: Deixa o fundo transparente para usar a cor do Tailwind
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    // Não definimos scene.background para usar o background do CSS (seu tema)

    const camera = new THREE.OrthographicCamera(
      width / -2,
      width / 2,
      height / 2,
      height / -2,
      1,
      1000
    );
    camera.position.z = 100;

    // Centralizar o mapa
    const projection = geoMercator()
      .scale(1200) 
      .center([-55, -15])
      .translate([0, 0]);

    const pathGenerator = geoPath().projection(projection);

    // --- UTILITÁRIOS ---
    const parseDToMultiPaths = (d: string) => {
      try {
        const commands = parseSVG(d);
        const paths: THREE.Vector3[][] = [];
        let currentPath: THREE.Vector3[] = [];
        
        // @ts-ignore - svg-path-parser types can be tricky
        commands.forEach((cmd) => {
          if (cmd.code === "M") {
            if (currentPath.length > 0) paths.push(currentPath);
            currentPath = [];
          }
          // @ts-ignore
          if (cmd.x !== undefined && cmd.y !== undefined) {
             // @ts-ignore
            currentPath.push(new THREE.Vector3(cmd.x, -cmd.y, 0));
          }
        });
        if (currentPath.length > 0) paths.push(currentPath);
        return paths;
      } catch (e) {
        return [];
      }
    };

    const getLineLength = (points: THREE.Vector3[]) => {
      let len = 0;
      for (let i = 0; i < points.length - 1; i++) {
        len += points[i].distanceTo(points[i + 1]);
      }
      return len;
    };

    // --- CONFIGURAÇÃO DA ANIMAÇÃO ---
    const ANIM_STATE = {
      DRAWING_WHITE: 0,
      DRAWING_GREEN: 1,
      FADING_GREEN: 2,
      WAITING: 3,
    };

    let currentState = ANIM_STATE.DRAWING_WHITE;
    let waitStartTime = 0;
    const LOOP_DELAY = 2;
    let animationId: number;
    
    // Tipagem rápida para o par de linhas
    interface LinePair {
        white: Line2;
        green: Line2;
        len: number;
        speed: number;
    }
    const animatedLinePairs: LinePair[] = [];

    // --- INIT ---
    const init = async () => {
      // Fetch do arquivo na pasta PUBLIC
      const response = await fetch("/brazil-states.geojson");
      const geo = await response.json();

      // @ts-ignore
      geo.features.forEach((feature) => {
        const d = pathGenerator(feature);
        if (!d) return;
        const shapeParts = parseDToMultiPaths(d);

        shapeParts.forEach((pts) => {
          if (pts.length < 2) return;

          const positions: number[] = [];
          pts.forEach((p) => positions.push(p.x, p.y, p.z));
          const lineLength = getLineLength(pts);

          const geometry = new LineGeometry();
          geometry.setPositions(positions);

          // 1. LINHA BASE (Cor Muted do seu tema)
          // Estou usando uma cor próxima ao seu --muted-foreground (cinza azulado)
          const whiteMat = new LineMaterial({
            color: 0x94a3b8, // Slate-400 (similar ao seu muted-foreground)
            linewidth: 2,
            dashed: true,
            dashSize: lineLength,
            gapSize: lineLength * 2,
            resolution: new THREE.Vector2(width, height),
            opacity: 0.3, // Mais sutil
            transparent: true
          });
          whiteMat.dashOffset = lineLength;

          const whiteLine = new Line2(geometry, whiteMat);
          whiteLine.computeLineDistances();
          whiteLine.position.z = 0;
          scene.add(whiteLine);

          // 2. LINHA DESTAQUE (Sua cor Emerald Glow ou Primary)
          // Usando um verde neon/emerald
          const greenMat = new LineMaterial({
            color: 0x34d399, // Emerald-400
            linewidth: 3,
            dashed: true,
            dashSize: lineLength,
            gapSize: lineLength * 2,
            transparent: true,
            opacity: 1,
            resolution: new THREE.Vector2(width, height),
            depthTest: false,
          });
          greenMat.dashOffset = lineLength;

          const greenLine = new Line2(geometry, greenMat);
          greenLine.computeLineDistances();
          greenLine.position.z = 1;
          greenLine.renderOrder = 999;
          greenLine.visible = false;
          scene.add(greenLine);

          animatedLinePairs.push({
            white: whiteLine,
            green: greenLine,
            len: lineLength,
            speed: lineLength * 0.015,
          });
        });
      });

      animate(0);
    };

    const animate = (time: number) => {
      animationId = requestAnimationFrame(animate);

      let allDone = true;

      // Lógica da máquina de estados (igual ao original)
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
        }
      } else if (currentState === ANIM_STATE.DRAWING_GREEN) {
        animatedLinePairs.forEach((pair) => {
            if (pair.green.material.dashOffset > 0) {
                pair.green.material.dashOffset -= pair.speed * 1.5;
                if (pair.green.material.dashOffset < 0) pair.green.material.dashOffset = 0;
                allDone = false;
            }
        });
        if (allDone) currentState = ANIM_STATE.FADING_GREEN;
      } else if (currentState === ANIM_STATE.FADING_GREEN) {
        let stillFading = false;
        animatedLinePairs.forEach((pair) => {
            if (pair.green.material.opacity > 0) {
                pair.green.material.opacity -= 0.02;
                if (pair.green.material.opacity < 0) pair.green.material.opacity = 0;
                stillFading = true;
            }
        });
        if (!stillFading) {
            currentState = ANIM_STATE.WAITING;
            waitStartTime = time;
            animatedLinePairs.forEach((p) => (p.green.visible = false));
        }
      } else if (currentState === ANIM_STATE.WAITING) {
        if ((time - waitStartTime) / 1000 > LOOP_DELAY) {
            currentState = ANIM_STATE.DRAWING_GREEN;
            animatedLinePairs.forEach((pair) => {
                pair.green.visible = true;
                pair.green.material.opacity = 1;
                pair.green.material.dashOffset = pair.len;
            });
        }
      }

      renderer.render(scene, camera);
    };

    init();

    // --- CLEANUP ---
    // Muito importante no React para evitar vazamento de memória
    return () => {
      cancelAnimationFrame(animationId);
      renderer.dispose();
      // Opcional: Limpar a cena
      scene.clear();
    };
  }, []); // Array vazio = roda apenas uma vez ao montar

  return (
    <div ref={containerRef} className="w-full h-full min-h-[500px] flex items-center justify-center">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
}