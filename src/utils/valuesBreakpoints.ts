const valuesBreakpoints: {
  speed: { [percentage: number]: string };
  reverb: { [percentage: number]: string };
  distance: { [percentage: number]: string };
} = {
  speed: {
    0: 'Cursed',
    30: 'Slowed down',
    '37.5': 'Perfect slowing',
    45: 'A bit under',
    50: 'Normal',
    75: 'Sped up',
    100: 'Nightcore',
  },
  reverb: {
    0: 'Normal',
    20: 'A bit wet',
    40: 'A bit more wet',
    60: 'Wet',
    80: 'Very wet',
    100: 'Soaked',
  },
  distance: {
    0: 'Near you',
    50: 'A little bit muffled',
    75: 'Muffled',
    85: 'Under your pillow',
    95: 'Next room',
    100: 'Next flat',
  },
};

export default valuesBreakpoints;
