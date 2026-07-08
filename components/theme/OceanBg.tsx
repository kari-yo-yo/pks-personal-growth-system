'use client';

import OceanWaves from './OceanWaves';
import Bubbles from './Bubbles';
import UnderwaterLightRays from './UnderwaterLightRays';

export default function OceanBg() {
  return (
    <>
      <UnderwaterLightRays count={4} />
      <Bubbles count={25} />
      <OceanWaves />
    </>
  );
}
