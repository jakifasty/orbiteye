import { Satellite } from "../model/satellite";
import { parseTLE, getAverageOrbitTimeMS, getLastAntemeridianCrossingTimeMS, getOrbitTrack, LngLat } from 'tle.js';

const _MS_IN_A_MINUTE = 60000;
const _MS_IN_A_DAY = 1440000;


/**
 * Gets the ground trace of a satellite's current orbit (always starting at the antimeridian).
 * Returns orbit trace in [lng, lag] format to work better with GeoJSON.
 * 
 * @param sat Satellite
 * @param stepMS Step size in milliseconds of returned orbit
 * @returns (Promise of) list of [lng, lat] formatted positions separated by stepMS milliseconds
 */
export async function groundTrace(sat: Satellite, stepMS: number = 1000): Promise<LngLat[]> {
  if (!sat.tle) throw Error(`TLE doesn't exist for satellite ${sat.id}`);

  // Copied from tle.js getGroundTracks but returns just current orbit

  const startTimeMS = Date.now();
  const parsedTLE = parseTLE(sat.tle);
  const orbitStartMS = getAverageOrbitTimeMS(parsedTLE);
  const curOrbitStartMS = getLastAntemeridianCrossingTimeMS(
    parsedTLE,
    startTimeMS
  );

  if (curOrbitStartMS == -1) {
    // Geosync or unusual orbit, so just return a Promise for a partial orbit track.

    return getOrbitTrack({
      tle: parsedTLE,
      startTimeMS,
      stepMS: _MS_IN_A_MINUTE,
      maxTimeMS: _MS_IN_A_DAY / 4,
    });
  }

  return getOrbitTrack({
    tle: parsedTLE,
    startTimeMS: orbitStartMS,
    stepMS,
  });
}