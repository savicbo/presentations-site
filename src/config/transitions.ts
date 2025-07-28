export interface TransitionConfig {
  name: string;
  displayName: string;
  duration: number; // in milliseconds
  cssClass: string;
  description: string;
}

export const AVAILABLE_TRANSITIONS: TransitionConfig[] = [
  {
    name: 'none',
    displayName: 'None',
    duration: 0,
    cssClass: 'transition-none',
    description: 'No transition - instant slide change'
  },
  {
    name: 'fade',
    displayName: 'Fade',
    duration: 500,
    cssClass: 'transition-fade',
    description: 'Smooth fade in/out between slides'
  },
  {
    name: 'slide-left',
    displayName: 'Slide Left',
    duration: 600,
    cssClass: 'transition-slide-left',
    description: 'Slides move from right to left'
  },
  {
    name: 'slide-right',
    displayName: 'Slide Right',
    duration: 600,
    cssClass: 'transition-slide-right',
    description: 'Slides move from left to right'
  },
  {
    name: 'slide-up',
    displayName: 'Slide Up',
    duration: 600,
    cssClass: 'transition-slide-up',
    description: 'Slides move from bottom to top'
  },
  {
    name: 'slide-down',
    displayName: 'Slide Down',
    duration: 600,
    cssClass: 'transition-slide-down',
    description: 'Slides move from top to bottom'
  },
  {
    name: 'zoom',
    displayName: 'Zoom',
    duration: 700,
    cssClass: 'transition-zoom',
    description: 'Zoom in/out effect between slides'
  },
  {
    name: 'flip',
    displayName: 'Flip',
    duration: 800,
    cssClass: 'transition-flip',
    description: '3D flip effect between slides'
  },
  {
    name: 'cube',
    displayName: 'Cube',
    duration: 900,
    cssClass: 'transition-cube',
    description: '3D cube rotation effect'
  },
  {
    name: 'defocus',
    displayName: 'Defocus',
    duration: 600,
    cssClass: 'transition-defocus',
    description: 'Blur out then focus in effect'
  }
];

export function getTransitionByName(name: string): TransitionConfig {
  return AVAILABLE_TRANSITIONS.find(t => t.name === name) || AVAILABLE_TRANSITIONS[0];
}

export const DEFAULT_TRANSITION = 'fade';
