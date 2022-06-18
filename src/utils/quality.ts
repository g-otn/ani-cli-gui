import { Quality } from '../api/url-processing';

// Returns number representing closest to desired quality from available
export const getClosestQuality = (available: number[], desired: Quality) => {
  const worstToBest = available.sort((a, b) => a - b);

  if (desired === 'worst') return worstToBest[0];
  if (desired === 'best') return worstToBest[worstToBest.length - 1];

  const goal = parseInt(desired);

  // closest available quality
  const closestQuality = worstToBest.reduce(
    (prev, curr) =>
      Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev,
    worstToBest[worstToBest.length - 1]
  );
  console.log(`Closest quality found for ${desired}: ${closestQuality}`);
  return closestQuality;
};
