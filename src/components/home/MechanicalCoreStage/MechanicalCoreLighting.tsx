export function MechanicalCoreLighting() {
  return <>
    <ambientLight intensity={0.3} />
    <directionalLight position={[4.5, 5.8, 5.5]} intensity={1.8} color="#e3e7e8" castShadow shadow-mapSize={[1024, 1024]} shadow-bias={-0.00015} />
    <directionalLight position={[-4.5, 2.2, 1.5]} intensity={0.55} color="#9ba6aa" />
    <directionalLight position={[0, 1.5, -4]} intensity={0.72} color="#b7c0c3" />
    <pointLight position={[-2.2, -0.1, 2.8]} intensity={0.28} color="#c9d0d3" distance={6} />
  </>
}
