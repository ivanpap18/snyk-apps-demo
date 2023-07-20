import { readFromDb } from '../../utils/db';
import { callSnykApi } from '../../utils/api';
import { EncryptDecrypt } from '../../utils/encrypt-decrypt';
import { APIVersion, AuthData, Envars } from '../../types';
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

  // Decrypt data(access token)
  const eD = new EncryptDecrypt(process.env[Envars.EncryptionSecret] as string);
  const access_token = eD.decryptString(data?.access_token);
  const token_type = data?.token_type;

  
  
    // Call the axios instance configured for Snyk API v1
  const requests = (data?.orgs ?? []).map((org) =>
    callSnykApi(token_type, access_token, APIVersion.V1)
      .get(`/org/${org.id}/members`)
      .then((project) => ({
        org: org.name,
        projects: project.data.projects || [],
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
