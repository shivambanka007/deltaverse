export const FiColors = {
  // Primary Palette
  primary: '#02B899',        // jungle_green
  secondary: '#4B7672',      // myrtle_green
  background: '#272A29',     // jet
  surface: '#1C1B1C',       // eerie_black
  text: '#FBFDFD',          // white
  
  // Extended Scales
  myrtleGreen: '#4b7672',
  myrtleGreen300: '#2d4744',
  myrtleGreen600: '#659c97',
  myrtleGreen700: '#8bb5b1',
  
  jungleGreen: '#02b899',
  jungleGreen300: '#016d5b',
  jungleGreen700: '#3dfddd',
  jungleGreen800: '#7efee8',
  
  jet: '#272a29',
  jet600: '#505755',
  
  eerieBlack: '#1c1b1c',
  eerieBlack600: '#4b484b',
  eerieBlack800: '#a6a2a6',
  
  white: '#fbfdfd',
};

export const FiTheme = {
  colors: FiColors,
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32
  },
  borderRadius: {
    sm: 8, md: 12, lg: 16, xl: 20
  },
  typography: {
    h1: { fontSize: 28, fontWeight: '600' },
    h2: { fontSize: 24, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400' },
    caption: { fontSize: 12, fontWeight: '400' }
  }
};