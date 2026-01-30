import { IMovementData } from '../types';

interface MetricsInput {
  startTime: Date;
  endTime: Date;
  steps: number;
  distance: number;
  movementData: IMovementData[];
}

interface MetricsOutput {
  duration: number;
  avgPace: number;
  calories: number;
  avgCadence: number;
  avgSpeed: number;
}

export const processMetrics = (input: MetricsInput): MetricsOutput => {
  const { startTime, endTime, steps, distance, movementData } = input;

  // Calculate duration in seconds
  const duration = (endTime.getTime() - startTime.getTime()) / 1000;

  // Calculate average pace (minutes per kilometer)
  // If distance is in meters, convert to kilometers
  const distanceKm = distance / 1000;
  const durationMin = duration / 60;
  const avgPace = distanceKm > 0 ? durationMin / distanceKm : 0;

  // Estimate calories burned (rough calculation)
  // Formula: calories = steps * 0.04 (approximate)
  const calories = Math.round(steps * 0.04);

  // Calculate average cadence and speed from movement data
  let avgCadence = 0;
  let avgSpeed = 0;

  if (movementData && movementData.length > 0) {
    const totalCadence = movementData.reduce((sum, data) => sum + data.cadence, 0);
    const totalSpeed = movementData.reduce((sum, data) => sum + data.speed, 0);
    
    avgCadence = totalCadence / movementData.length;
    avgSpeed = totalSpeed / movementData.length;
  } else {
    // Fallback: calculate from total values.
    // NOTE: This uses the total session duration (including any breaks),
    //       so avgCadence here is "overall session steps per minute" and
    //       may underestimate true active cadence if the user pauses.
    avgSpeed = distance / duration; // meters per second
    avgCadence = steps / durationMin; // steps per minute (overall session)
  }

  return {
    duration,
    avgPace,
    calories,
    avgCadence,
    avgSpeed,
  };
};
