import styled from "styled-components";
import MoleVisible from "@assets/pengu.png";
import MoleHit from "@assets/pengu-hit.png";
import MoleHidden from "@assets/pengu-hidden.png";

export const MoleContainer = styled.div<{ isHitting?: boolean; hitAnimation?: 'none' | 'hit' | 'miss' }>`
  height: 90px;
  justify-content: center;
  position: relative;
  width: 100%;
  transform: ${props => props.isHitting ? 'scale(0.95)' : 'scale(1)'};
  transition: transform 0.1s ease;

  &::after {
    background: url(${MoleHidden}) center bottom / contain no-repeat;
    bottom: -18px;
    content: "";
    height: 30px;
    justify-content: center;
    position: absolute;
    width: 100%;
    z-index: 2;
  }

  > div {
    overflow: hidden;
    position: relative;
    width: 100%;
    height: 100%;
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => {
      if (props.hitAnimation === 'hit') {
        return 'radial-gradient(circle, rgba(0, 100, 255, 0.4) 0%, transparent 70%)';
      } else if (props.hitAnimation === 'miss') {
        return 'radial-gradient(circle, rgba(255, 0, 0, 0.4) 0%, transparent 70%)';
      }
      return 'radial-gradient(circle, rgba(255, 0, 0, 0.3) 0%, transparent 70%)';
    }};
    opacity: ${props => (props.isHitting || props.hitAnimation !== 'none') ? 1 : 0};
    transition: opacity 0.1s ease;
    z-index: 3;
    pointer-events: none;
  }

  @media (min-width: 1400px) {
    height: 150px;
    width: 180px;

    &::after {
      height: 70px;
    }
  }
`;

export const MoleItem = styled.div<{ isWhacked?: boolean }>`
  background: url(${props => props.isWhacked ? MoleHit : MoleVisible}) 2px 15px / contain no-repeat;
  bottom: -6px;
  height: 70px;
  position: absolute;
  width: 70px;
  z-index: 1;

  @media (min-width: 1400px) {
    background-position: 25px 15px;
    bottom: 20px;
    height: 110px;
    width: 165px;
  }
`;
