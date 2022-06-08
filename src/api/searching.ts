import { getClient, ResponseType } from '@tauri-apps/api/http';
import { agent, baseURL, extendedBaseURL } from '../utils/constants';

/**
 * gets anime names along with its id for search term
 */
export const searchAnime = async (search: string) => {
  const keyword = encodeURIComponent(search.replaceAll(' ', '-'));

  const client = await getClient();

  const doc = await client
    .get<string>(`${baseURL}/search.html?keyword=${keyword}`, {
      headers: { 'User-Agent': agent },
      responseType: ResponseType.Text,
    })
    .then((res) => res.data)
    .then((html) => new DOMParser().parseFromString(html, 'text/html'))
    .catch(console.error);

  if (!doc) return [];

  const anchors = doc.querySelectorAll<HTMLAnchorElement>(
    'a[href^="/videos/"]'
  );

  return Array.from(anchors)
    .map((a) => {
      const [, id] = a.href.match(/\/videos\/(\S+)-episode-(\d+)$/);
      const img = a.querySelector<HTMLImageElement>('.picture img');
      const picture = img.src;
      const name = img.alt;

      return { id, picture, name };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * searches on gogoanime (instead of gogoplay) because they index english titles
 */
export const extendedSearch = async (search: string) => {
  const keyword = encodeURIComponent(search);

  const client = await getClient();

  const doc = await client
    .get<string>(`${extendedBaseURL}/search.html?keyword=${keyword}`, {
      headers: { 'User-Agent': agent },
      responseType: ResponseType.Text,
    })
    .then((res) => res.data)
    .then((html) => new DOMParser().parseFromString(html, 'text/html'))
    .catch(console.error);

  if (!doc) return [];

  const anchors = doc.querySelectorAll<HTMLAnchorElement>(
    '.img > a[href^="/category/"]'
  );

  return Array.from(anchors)
    .map((a) => {
      const [, id] = a.href.match(/\/category\/(\S+)$/);
      const img = a.querySelector<HTMLImageElement>('img');
      const picture = img.src;
      const name = img.alt;

      return { id, picture, name };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

export const processSearch = async (search: string) => {
  let results = (await searchAnime(search).catch(console.error)) || [];

  if (!results?.length) {
    console.log('no results, doing extended search');
    // extended search has results of its own but we only use them to get the id and search again
    const extendedResults =
      (await extendedSearch(search).catch(console.error)) || [];
    const firstExtendedResultId = extendedResults?.[0].id;

    if (firstExtendedResultId) {
      console.log(firstExtendedResultId, 'extended result found');
      results =
        (await searchAnime(firstExtendedResultId).catch(console.error)) || [];
    }
  }

  return results;
};
