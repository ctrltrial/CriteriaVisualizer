import { useState, useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LabelItem } from "../utils/data";

interface LabelsProps {
  labels: LabelItem[];
  onHover: (clusterId: string | undefined) => void;
  hoveredCluster?: string;
}

function Labels({ labels, onHover, hoveredCluster }: LabelsProps) {
  const { camera } = useThree();
  const [elements] = useState(() =>
    labels.map(() => document.createElement("div"))
  );
  const groupRef = useRef<HTMLDivElement | null>(null);
  const isZoomingRef = useRef(false);
  const zoomTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const group = document.createElement("div");
    group.style.position = "absolute";
    group.style.top = "0";
    group.style.left = "0";
    group.className = "labels-container";
    groupRef.current = group;
    document.body.appendChild(group);

    // Handle wheel events to temporarily disable pointer events
    const handleWheel = () => {
      if (groupRef.current) {
        groupRef.current.style.pointerEvents = "none";
        isZoomingRef.current = true;

        // Clear existing timeout
        if (zoomTimeoutRef.current) {
          clearTimeout(zoomTimeoutRef.current);
        }

        // Re-enable pointer events after a delay
        zoomTimeoutRef.current = setTimeout(() => {
          if (groupRef.current) {
            groupRef.current.style.pointerEvents = "auto";
            isZoomingRef.current = false;
          }
        }, 150); // Adjust this delay as needed
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: true });

    elements.forEach((element, i) => {
      element.className = "label-element";
      element.style.position = "absolute";
      element.style.padding = "4px 8px";
      element.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
      element.style.borderRadius = "4px";
      element.style.color = "#fff";
      element.style.fontSize = "14px";
      element.style.cursor = "pointer";
      element.style.transition = "background-color 0.2s";
      element.textContent = labels[i].LABEL;

      element.onmouseenter = () =>
        !isZoomingRef.current && onHover(String(labels[i].CLUSTER));
      element.onmouseleave = () => !isZoomingRef.current && onHover(undefined);

      group.appendChild(element);
    });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      if (zoomTimeoutRef.current) {
        clearTimeout(zoomTimeoutRef.current);
      }
      document.body.removeChild(group);
    };
  }, []);

  useFrame(() => {
    if (!groupRef.current) return;

    elements.forEach((element, i) => {
      const label = labels[i];
      const vector = new THREE.Vector3(label.X, label.Y, 0);
      vector.project(camera);

      const x = (vector.x * 0.5 + 0.5) * window.innerWidth;
      const y = (-vector.y * 0.5 + 0.5) * window.innerHeight;

      element.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
      element.style.backgroundColor =
        hoveredCluster === String(label.CLUSTER)
          ? "rgb(0, 0, 0)"
          : "rgba(0, 0, 0, 0.6)";
    });
  });

  return null;
}

export default Labels;
