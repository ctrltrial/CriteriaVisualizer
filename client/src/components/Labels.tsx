import { useEffect, useMemo, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LabelItem } from "../utils/data";

interface LabelsProps {
  labels: LabelItem[];
  onHover: (clusterId: string | undefined) => void;
  hoveredCluster?: string;
}

export default function Labels({ labels, onHover, hoveredCluster }: LabelsProps) {
  const { camera } = useThree();
  const groupRef = useRef<HTMLDivElement | null>(null);
  const isZoomingRef = useRef(false);
  const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Create or update label elements when `labels` changes
  const elements = useMemo(() => {
    return labels.map(() => {
      const el = document.createElement("div");
      el.className = "label-element";
      el.style.position = "absolute";
      el.style.padding = "4px 8px";
      el.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
      el.style.borderRadius = "4px";
      el.style.color = "#fff";
      el.style.fontSize = "14px";
      el.style.cursor = "pointer";
      el.style.transition = "background-color 0.2s, transform 0.2s";
      return el;
    });
  }, [labels]);

  useEffect(() => {
    // Wheel handler: disable pointer events while zooming
    const handleWheel = () => {
      if (!groupRef.current) return;
      groupRef.current.style.pointerEvents = "none";
      isZoomingRef.current = true;
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
      zoomTimeoutRef.current = setTimeout(() => {
        if (groupRef.current) {
          groupRef.current.style.pointerEvents = "auto";
          isZoomingRef.current = false;
        }
      }, 150);
    };

    // Create container for labels
    const group = document.createElement("div");
    group.style.position = "absolute";
    group.style.top = "0";
    group.style.left = "0";
    group.className = "labels-container";
    document.body.appendChild(group);
    groupRef.current = group;

    // Append label elements and wire hover events
    elements.forEach((el, i) => {
      const lbl = labels[i];
      if (!lbl) return;
      el.textContent = lbl.LABEL;
      el.onmouseenter = () => {
        if (!isZoomingRef.current) onHover(String(lbl.CLUSTER));
      };
      el.onmouseleave = () => {
        if (!isZoomingRef.current) onHover(undefined);
      };
      group.appendChild(el);
    });

    window.addEventListener("wheel", handleWheel, { passive: true });

    // Cleanup on unmount or labels change
    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
      if (groupRef.current) {
        document.body.removeChild(groupRef.current);
        groupRef.current = null;
      }
    };
  }, [elements, labels, onHover]);

  // Update label positions each frame
  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    elements.forEach((el, i) => {
      const lbl = labels[i];
      if (!lbl) return;
      // Project 3D label coord to screen space
      const vec = new THREE.Vector3(lbl.X, lbl.Y, 0).project(camera);
      const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-vec.y * 0.5 + 0.5) * window.innerHeight;

      const isHovered = hoveredCluster === String(lbl.CLUSTER);
      const scale = isHovered ? 1.1 : 1;
      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px) scale(${scale})`;
      el.style.backgroundColor = isHovered ? "rgb(0, 0, 0)" : "rgba(0, 0, 0, 0.6)";
      el.style.zIndex = isHovered ? "1" : "0";
    });
  });

  return null;
}
