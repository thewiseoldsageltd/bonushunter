export const localize = (region: string, usText: string): string => {
  if (region === 'UK' || region === 'EU') {
    return usText
      .replace(/personalized/g, 'personalised')
      .replace(/Personalized/g, 'Personalised')
      .replace(/favorite/g, 'favourite')
      .replace(/Favorite/g, 'Favourite')
      .replace(/color/g, 'colour')
      .replace(/Color/g, 'Colour')
      .replace(/analyze/g, 'analyse')
      .replace(/Analyze/g, 'Analyse')
      .replace(/optimized/g, 'optimised')
      .replace(/Optimized/g, 'Optimised');
  }
  return usText;
};

export const getLocalizedText = (region: string) => ({
  personalized: region === 'UK' || region === 'EU' ? 'personalised' : 'personalized',
  favorite: region === 'UK' || region === 'EU' ? 'favourite' : 'favorite',
  color: region === 'UK' || region === 'EU' ? 'colour' : 'color',
  analyze: region === 'UK' || region === 'EU' ? 'analyse' : 'analyze',
  optimized: region === 'UK' || region === 'EU' ? 'optimised' : 'optimized',
});
