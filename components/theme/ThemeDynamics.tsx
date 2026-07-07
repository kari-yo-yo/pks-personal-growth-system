'use client';

import { ThemeDynamics as ThemeDynamicsType } from '@/types';
import OceanWaves from './OceanWaves';
import Bubbles from './Bubbles';
import FallingLeaves from './FallingLeaves';
import LightSpots from './LightSpots';
import SunRays from './SunRays';
import GoldenParticles from './GoldenParticles';
import NebulaEffect from './NebulaEffect';
import MeteorShower from './MeteorShower';

interface Props {
  dynamics: ThemeDynamicsType;
}

export default function ThemeDynamics({ dynamics }: Props) {
  switch (dynamics) {
    case 'ocean':
      return (
        <>
          <Bubbles count={25} />
          <OceanWaves />
        </>
      );
    case 'forest':
      return (
        <>
          <LightSpots count={8} />
          <FallingLeaves count={15} />
        </>
      );
    case 'golden':
      return (
        <>
          <SunRays />
          <GoldenParticles count={40} />
        </>
      );
    case 'cosmic':
      return (
        <>
          <NebulaEffect count={5} />
          <MeteorShower />
        </>
      );
    case 'nebula':
      return <NebulaEffect count={4} />;
    case 'monochrome':
      return null;
    default:
      return null;
  }
}
