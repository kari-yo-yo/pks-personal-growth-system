'use client';

import { ThemeDynamics as ThemeDynamicsType } from '@/types';
import OceanWaves from './OceanWaves';
import Bubbles from './Bubbles';
import UnderwaterLightRays from './UnderwaterLightRays';
import FallingLeaves from './FallingLeaves';
import LightSpots from './LightSpots';
import SwayingGrass from './SwayingGrass';
import SunRays from './SunRays';
import GoldenParticles from './GoldenParticles';
import WarmGlow from './WarmGlow';
import NebulaEffect from './NebulaEffect';
import MeteorShower from './MeteorShower';
import StarField from './StarField';

interface Props {
  dynamics: ThemeDynamicsType;
}

export default function ThemeDynamics({ dynamics }: Props) {
  switch (dynamics) {
    case 'ocean':
      return (
        <>
          <UnderwaterLightRays count={4} />
          <Bubbles count={25} />
          <OceanWaves />
        </>
      );
    case 'forest':
      return (
        <>
          <LightSpots count={8} />
          <FallingLeaves count={15} />
          <SwayingGrass count={50} />
        </>
      );
    case 'golden':
      return (
        <>
          <SunRays />
          <GoldenParticles count={40} />
          <WarmGlow count={5} />
        </>
      );
    case 'cosmic':
      return (
        <>
          <StarField count={300} />
          <NebulaEffect count={5} />
          <MeteorShower />
        </>
      );
    case 'nebula':
      return (
        <>
          <StarField count={150} />
          <NebulaEffect count={4} />
        </>
      );
    case 'monochrome':
      return null;
    default:
      return null;
  }
}
