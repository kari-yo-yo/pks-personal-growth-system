'use client';

import FallingLeaves from './FallingLeaves';
import LightSpots from './LightSpots';
import SwayingGrass from './SwayingGrass';

export default function ForestBg() {
  return (
    <>
      <LightSpots count={8} />
      <FallingLeaves count={15} />
      <SwayingGrass count={50} />
    </>
  );
}
