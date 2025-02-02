import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { useEffect, useRef } from "react";

function Points() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const numPoints = 2500;

  useEffect(() => {
    if (!meshRef.current) return;

    const mesh = meshRef.current;
    const dummy = new THREE.Object3D();

    // Create a temp array to store matrices for better performance
    const matrices: THREE.Matrix4[] = [];

    for (let i = 0; i < numPoints; i++) {
      dummy.position.set(
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20,
        (Math.random() - 0.5) * 20
      );
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }

    // Set all matrices at once
    matrices.forEach((matrix, i) => mesh.setMatrixAt(i, matrix));
    mesh.instanceMatrix.needsUpdate = true;
  }, []);

  return (
    <instancedMesh
      ref={meshRef}
      args={[
        undefined as unknown as THREE.BufferGeometry,
        undefined as unknown as THREE.Material,
        numPoints,
      ]}
    >
      <sphereGeometry args={[0.05, 10, 10]} />
      <meshBasicMaterial color="blue" />
    </instancedMesh>
  );
}

export default Points;
