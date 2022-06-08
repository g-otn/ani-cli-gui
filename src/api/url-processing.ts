import { getClient, ResponseType } from '@tauri-apps/api/http';
import { agent, baseURL } from '../utils/constants';

const getDownloadPageLink = async (animeId: string, episodeNumber: number) => {
  const client = await getClient();

  const doc = await client
    .get<string>(`${baseURL}/videos/${animeId}-episode-${episodeNumber}`, {
      headers: { 'User-Agent': agent },
      responseType: ResponseType.Text,
    })
    .then((res) => new DOMParser().parseFromString(res.data, 'text/html'));

  return doc.querySelector('iframe').src;
};

export const getVideoLink = async (animeId: string, episodeNumber: number) => {
  const downloadPageURL = await getDownloadPageLink(animeId, episodeNumber);

  const client = await getClient();

  const doc = await client
    .get(downloadPageURL, {
      headers: { 'User-Agent': agent },
      responseType: ResponseType.Text,
    })
    .then((res) =>
      new DOMParser().parseFromString(res.data as string, 'text/html')
    );

  console.log('doc', doc);
};
