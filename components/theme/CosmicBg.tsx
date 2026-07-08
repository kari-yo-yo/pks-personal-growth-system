'use client';

import StarField from './StarField';
import NebulaEffect from './NebulaEffect';
import MeteorShower from './MeteorShower';

export default function CosmicBg() {
  return (
    <>
      <StarField count={300} />
      <NebulaEffect count={5} />
      <MeteorShower />
    </>
  );
}
