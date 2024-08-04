export const getRandomElement = <T>(array: T[]) => {
  if (array.length === 0) return;
  if (array.length === 1) array[0];

  const randomIndex = Math.floor(Math.random() * array.length);

  return array[randomIndex];
};
