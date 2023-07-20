import { readFromDb } from '../../utils/db';
import { callSnykApi, callSnykApiWithToken } from '../../utils/api';
import { EncryptDecrypt } from '../../utils/encrypt-decrypt';
import { APIVersion, AuthData, Envars } from '../../types';
import { getAccess } from '../../helper';
// import { error } from 'console';
// import { json } from 'stream/consumers';

/**
 * Get members handler that fetches all members
 * from the Snyk API using user access token. This for
 * example purposes. In production it will depend on your
 * token scopes on what you can and can not access
 * @returns List of all members or an empty array
 */
export async function getMembersFromApi(): Promise<unknown[]> {
  // Read data from DB
  const db = await readFromDb();
  const data = mostRecent(db.installs);
  // If no data return empty array
  if (!data) return [];
    // Call the axios instance configured for Snyk API v1
    const requests = (data?.orgs ?? []).map((org: any) =>
    callSnykApiWithToken(APIVersion.V1)
      .get(`/org/${org.id}/members`)
      .then((members) => ({
        org: org.name,
        members: members.data || [],
      }))
      .catch((reason) => {console.error(JSON.stringify(reason))}),
  );

  return Promise.all(requests);
}

/**
 *
 * @param {AuthData[]} installs get most recent install from list of installs
 * @returns the latest install or void
 */
export function mostRecent(installs: AuthData[]): AuthData | void {
  if (installs) {
    return installs[installs.length - 1];
  }
  return;
}
