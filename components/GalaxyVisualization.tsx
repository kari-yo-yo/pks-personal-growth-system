'use client';

import React, { useRef, useMemo, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import * as THREE from 'three';
import { KnowledgeNode } from '@/types';

/* ─── 螺旋星系布局算法 ─── */

interface StarNode {
  id: string;
  title: string;
  position: [number, number, number];
  color: string;
  size: number;
  noteCount: number;
}

function generateGalaxyLayout(nodes: KnowledgeNode[], notesPerNode: Record<string, number>): StarNode[] {
  if (nodes.length === 0) return [];

  const starNodes: StarNode[] = [];
  const arms = 3; // 螺旋臂数量
  const spread = 0.6; // 扩散因子
  const armAngle = (2 * Math.PI) / arms;

  nodes.forEach((node, index) => {
    const noteCount = notesPerNode[node.id] || 0;
    // 距离中心的比例 (0.3 ~ 4.5)
    const radius = 0.3 + (index / nodes.length) * 4.2;
    // 所在的螺旋臂
    const arm = index % arms;
    // 螺旋角度
    const spinAngle = radius * 1.8;
    // 随机偏移（越远越分散）
    const randomX = (Math.random() - 0.5) * spread * (radius * 0.3);
    const randomZ = (Math.random() - 0.5) * spread * (radius * 0.3);
    const randomY = (Math.random() - 0.5) * 0.15;

    const x = Math.cos(armAngle * arm + spinAngle) * radius + randomX;
    const z = Math.sin(armAngle * arm + spinAngle) * radius + randomZ;

    // 颜色：根据笔记数量
    let color: string;
    if (noteCount === 0) {
      color = '#555566'; // 暗淡灰
    } else if (noteCount <= 2) {
      const warm = ['#ffe4c4', '#c4dfff', '#fffacd', '#d4c4ff'];
      color = warm[Math.floor(Math.random() * warm.length)];
    } else {
      color = '#ffffff'; // 明亮白
    }

    // 大小：笔记越多越大
    const size = noteCount === 0
      ? 0.04 + Math.random() * 0.02
      : 0.06 + Math.min(noteCount * 0.015, 0.12);

    starNodes.push({
      id: node.id,
      title: node.title,
      position: [x, randomY, z],
      color,
      size,
      noteCount,
    });
  });

  return starNodes;
}

/* ─── 单个知识节点星星 ─── */

function StarNodeMesh({
  node,
  isSelected,
  onSelect,
}: {
  node: StarNode;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const pulseRef = useRef(0);

  useFrame((_, delta) => {
    pulseRef.current += delta * 2;
    if (meshRef.current) {
      // 轻微脉动
      const scale = 1 + Math.sin(pulseRef.current) * 0.1;
      meshRef.current.scale.setScalar(scale);
    }
    if (glowRef.current) {
      // 选中/悬停时光圈
      const targetScale = (isSelected || hovered) ? 2.5 : 1;
      glowRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
      // 透明度
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = (isSelected || hovered) ? 0.4 + Math.sin(pulseRef.current * 1.5) * 0.15 : 0;
    }
  });

  return (
    <group position={node.position}>
      {/* 主星体 */}
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(node.id);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = 'default';
        }}
      >
        <sphereGeometry args={[node.size, 16, 16]} />
        <meshBasicMaterial color={node.color} />
      </mesh>

      {/* 光晕 */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[node.size * 1.8, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#ffffff' : node.color}
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* 点光源（选中时） */}
      {isSelected && (
        <pointLight color="#ffffff" intensity={0.5} distance={3} />
      )}

      {/* 标签 */}
      {(hovered || isSelected) && (
        <Html
          center
          distanceFactor={8}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div
            style={{
              background: 'rgba(10, 10, 20, 0.85)',
              backdropFilter: 'blur(8px)',
              border: `1px solid ${isSelected ? 'rgba(255,255,255,0.5)' : 'rgba(99,102,241,0.4)'}`,
              borderRadius: '8px',
              padding: '6px 12px',
              whiteSpace: 'nowrap',
              color: 'var(--color-text-primary)',
              fontSize: '13px',
              fontFamily: "'Noto Sans SC', system-ui, sans-serif",
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
              transform: 'translateY(-30px)',
            }}
          >
            {node.title}
            {node.noteCount > 0 && (
              <span style={{
                marginLeft: '6px',
                fontSize: '11px',
                color: 'var(--color-text-muted)',
              }}>
                {node.noteCount} 条笔记
              </span>
            )}
          </div>
        </Html>
      )}
    </group>
  );
}

/* ─── 流星效果 ─── */

function ShootingStars() {
  const linesRef = useRef<THREE.Line[]>([]);
  const count = 3;

  const trails = useMemo(() => {
    return Array.from({ length: count }, () => ({
      start: new THREE.Vector3(
        (Math.random() - 0.5) * 20,
        Math.random() * 8 + 4,
        (Math.random() - 0.5) * 20
      ),
      speed: 8 + Math.random() * 12,
      progress: Math.random(),
      active: false,
      cooldown: Math.random() * 15,
      direction: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        -1 - Math.random(),
        (Math.random() - 0.5) * 2
      ).normalize(),
    }));
  }, []);

  useFrame((_, delta) => {
    trails.forEach((trail, i) => {
      trail.cooldown -= delta;
      if (!trail.active && trail.cooldown <= 0) {
        trail.active = true;
        trail.progress = 0;
        trail.start.set(
          (Math.random() - 0.5) * 16,
          Math.random() * 6 + 3,
          (Math.random() - 0.5) * 16
        );
        trail.direction.set(
          (Math.random() - 0.5) * 2,
          -1 - Math.random(),
          (Math.random() - 0.5) * 2
        ).normalize();
      }

      if (trail.active) {
        trail.progress += delta * trail.speed * 0.1;
        if (trail.progress >= 1) {
          trail.active = false;
          trail.cooldown = 5 + Math.random() * 20;
        }
      }

      const line = linesRef.current[i];
      if (line) {
        const posAttr = line.geometry.getAttribute('position');
        if (posAttr) {
          const headPos = trail.start.clone().add(
            trail.direction.clone().multiplyScalar(trail.progress * 4)
          );
          const tailPos = headPos.clone().sub(
            trail.direction.clone().multiplyScalar(0.6)
          );

          if (trail.active) {
            posAttr.setXYZ(0, tailPos.x, tailPos.y, tailPos.z);
            posAttr.setXYZ(1, headPos.x, headPos.y, headPos.z);
            const mat = line.material as THREE.LineBasicMaterial;
            mat.opacity = trail.progress < 0.1
              ? trail.progress / 0.1
              : trail.progress > 0.7
                ? (1 - trail.progress) / 0.3
                : 1;
            mat.color.set('#ffffff');
          } else {
            posAttr.setXYZ(0, 0, 0, 0);
            posAttr.setXYZ(1, 0, 0, 0);
            (line.material as THREE.LineBasicMaterial).opacity = 0;
          }
          posAttr.needsUpdate = true;
        }
      }
    });
  });

  return (
    <group>
      {trails.map((_, i) => (
        <line key={i} ref={(el: any) => { if (el) linesRef.current[i] = el; }}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(6)}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial
            color="#ffffff"
            transparent
            opacity={0}
            linewidth={1}
          />
        </line>
      ))}
    </group>
  );
}

/* ─── 中心核心光点 ─── */

function GalaxyCore() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.2;
      meshRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group>
      <mesh ref={meshRef}>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshBasicMaterial color="#818cf8" />
      </mesh>
      <pointLight color="#6366f1" intensity={2} distance={8} />
      <pointLight color="#8b5cf6" intensity={1} distance={12} />
    </group>
  );
}

/* ─── 主场景 ─── */

function GalaxyScene({
  starNodes,
  selectedId,
  onSelect,
}: {
  starNodes: StarNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      {/* 环境光 */}
      <ambientLight intensity={0.15} />

      {/* 星空背景 */}
      <Stars
        radius={50}
        depth={60}
        count={800}
        factor={4}
        saturation={0.2}
        fade
        speed={0.3}
      />

      {/* 银河核心 */}
      <GalaxyCore />

      {/* 流星 */}
      <ShootingStars />

      {/* 知识节点星星 */}
      {starNodes.map((node) => (
        <StarNodeMesh
          key={node.id}
          node={node}
          isSelected={selectedId === node.id}
          onSelect={onSelect}
        />
      ))}

      {/* 轨道控制 */}
      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        autoRotate
        autoRotateSpeed={0.15}
        minDistance={2}
        maxDistance={15}
        enableDamping
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.85}
        minPolarAngle={Math.PI * 0.15}
      />
    </>
  );
}

/* ─── 导出组件 ─── */

interface GalaxyVisualizationProps {
  nodes: KnowledgeNode[];
  notesPerNode?: Record<string, number>;
  selectedId?: string | null;
  onSelectNode?: (id: string) => void;
  className?: string;
}

export default function GalaxyVisualization({
  nodes,
  notesPerNode = {},
  selectedId = null,
  onSelectNode,
  className = '',
}: GalaxyVisualizationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const starNodes = useMemo(
    () => generateGalaxyLayout(nodes, notesPerNode),
    [nodes, notesPerNode]
  );

  const handleSelect = useCallback(
    (id: string) => {
      onSelectNode?.(id);
    },
    [onSelectNode]
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${className}`}
      style={{ minHeight: '500px' }}
    >
      <Canvas
        camera={{
          position: [0, 4, 8],
          fov: 60,
          near: 0.1,
          far: 100,
        }}
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
        style={{ background: '#050510' }}
      >
        <GalaxyScene
          starNodes={starNodes}
          selectedId={selectedId}
          onSelect={handleSelect}
        />
      </Canvas>

      {/* UI 覆盖层 */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="glass rounded-xl px-4 py-2 pointer-events-auto">
          <p className="text-xs text-text-secondary">
            拖拽旋转 | 滚轮缩放 | 点击节点查看
          </p>
        </div>
      </div>

      {/* 节点统计 */}
      <div className="absolute bottom-4 left-4 pointer-events-none">
        <div className="glass rounded-xl px-4 py-2 pointer-events-auto">
          <p className="text-xs text-text-muted">
            {nodes.length} 个知识节点
            {Object.values(notesPerNode).reduce((a, b) => a + b, 0) > 0 &&
              ` · ${Object.values(notesPerNode).reduce((a, b) => a + b, 0)} 条笔记`
            }
          </p>
        </div>
      </div>
    </div>
  );
}
