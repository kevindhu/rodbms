import axios from 'axios';

export async function getDatastores(universeId: string, apiToken: string) {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores`;
  const response = await axios.get(apiUrl, {
    headers: {
      'x-api-key': apiToken,
      'Content-Type': 'application/json',
    },
    params: { limit: 100 },
  });
  return response.data;
}

export async function getDataStoreEntries(
  universeId: string, 
  apiToken: string, 
  datastoreName: string,
  prefix: string = '',
  cursor: string = '',
  limit: number = 100
) {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries`;
  const response = await axios.get(apiUrl, {
    headers: {
      'x-api-key': apiToken,
      'Content-Type': 'application/json',
    },
    params: { 
      datastoreName, 
      prefix,
      cursor,
      limit 
    },
  });
  return response.data;
}

export async function getDataStoreEntry(universeId: string, apiToken: string, datastoreName: string, entryKey: string, scope = '') {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry`;
  const response = await axios.get(apiUrl, {
    headers: {
      'x-api-key': apiToken,
      'Content-Type': 'application/json',
    },
    params: { datastoreName, entryKey, scope },
  });
  return response.data;
}

interface DataStoreParams {
  datastoreName: string;
  entryKey: string;
  scope?: string;
  matchVersion?: string;
  exclusiveCreate?: boolean;
}

export async function setDataStoreEntry(
  universeId: string,
  apiToken: string,
  datastoreName: string,
  entryKey: string,
  value: unknown,
  matchVersion?: string,
  exclusiveCreate?: boolean,
  scope = ''
) {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry`;
  const jsonValue = JSON.stringify(value);
  const params: DataStoreParams = { 
    datastoreName, 
    entryKey, 
    scope 
  };
  if (matchVersion) params.matchVersion = matchVersion;
  if (exclusiveCreate !== undefined) params.exclusiveCreate = exclusiveCreate;

  const response = await axios.post(apiUrl, jsonValue, {
    headers: {
      'x-api-key': apiToken,
      'Content-Type': 'application/json',
    },
    params,
  });
  return response.data;
}

export async function incrementDataStoreEntry(universeId: string, apiToken: string, datastoreName: string, entryKey: string, incrementBy: number, scope = '') {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry/increment`;
  const params = { datastoreName, entryKey, incrementBy, scope };

  // 'content-length': '0' is required for increment requests
  const response = await axios.post(apiUrl, null, {
    headers: {
      'x-api-key': apiToken,
      'content-length': '0',
    },
    params,
  });
  return response.data;
}

export async function deleteDataStoreEntry(universeId: string, apiToken: string, datastoreName: string, entryKey: string, scope = '') {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry`;
  const response = await axios.delete(apiUrl, {
    headers: {
      'x-api-key': apiToken,
      'Content-Type': 'application/json',
    },
    params: { datastoreName, entryKey, scope },
  });
  return response.data;
}

export async function listEntryVersions(
  universeId: string,
  apiToken: string,
  datastoreName: string,
  entryKey: string,
  scope = '',
  limit = 100
) {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry/versions`;
  const response = await axios.get(apiUrl, {
    headers: {
      'x-api-key': apiToken,
      'Content-Type': 'application/json',
    },
    params: { datastoreName, entryKey, scope, limit },
  });
  return response.data;
}

export async function getEntryVersion(
  universeId: string,
  apiToken: string,
  datastoreName: string,
  entryKey: string,
  versionId: string,
  scope = ''
) {
  const apiUrl = `https://apis.roblox.com/datastores/v1/universes/${universeId}/standard-datastores/datastore/entries/entry/versions/version`;
  // or append `/version` after the path, depending on how you prefer:
  //   e.g. `.../versions/${versionId}` (but official docs want a "versionId" param)
  const response = await axios.get(apiUrl, {
    headers: {
      'x-api-key': apiToken,
      'Content-Type': 'application/json',
    },
    params: { datastoreName, entryKey, versionId, scope },
  });
  return response.data;
}
