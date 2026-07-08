'use client';

import SunRays from './SunRays';
import GoldenParticles from './GoldenParticles';
import WarmGlow from './WarmGlow';

export default function HopeBg() {
  return (
    <>
      <SunRays />
      <GoldenParticles count={40} />
      <WarmGlow count={5} />
    </>
  );
}
