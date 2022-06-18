import { getClient, ResponseType } from '@tauri-apps/api/http';
import { agent, baseURL, extendedBaseURL } from '../utils/constants';
import { getDoc } from '../utils/request-to-doc';

export type Anime = {
  id: string;
  picture: string;
  name: string;
  numOfEpisodes: number;
};

/**
 * gets anime names along with its id for search term
 */
export const searchAnime = async (search: string) => {
  console.log('Searching (Goload)');
  const keyword = encodeURIComponent(search.replaceAll(' ', '-'));

  const doc = await getDoc(`${baseURL}/search.html?keyword=${keyword}`);

  if (!doc) return [];

  const anchors = doc.querySelectorAll<HTMLAnchorElement>(
    'a[href^="/videos/"]'
  );

  return Array.from(anchors)
    .map((a) => {
      const [, id, numOfEpisodes] = a.href.match(
        /\/videos\/(\S+)-episode-(\d+)$/
      );
      const img = a.querySelector<HTMLImageElement>('.picture img');
      const picture = img.src;
      const name = img.alt;

      return { id, picture, name, numOfEpisodes: parseInt(numOfEpisodes) };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
};

/**
 * searches on gogoanime (instead of gogoplay) because they index english titles
 */
export const extendedSearch = async (search: string) => {
  console.log('Searching (Gogoanime)');
  const keyword = encodeURIComponent(search);

  const doc = await getDoc(`${extendedBaseURL}/search.html?keyword=${keyword}`);

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

export const processSearch: (search: string) => Promise<Anime[]> = async (
  search
) => {
  let results = (await searchAnime(search).catch(console.error)) || [];

  if (!results?.length) {
    console.log('no results, doing extended search');
    // extended search has results of its own but we only use them to get the id and search again
    const extendedResults =
      (await extendedSearch(search).catch(console.error)) || [];
    const firstExtendedResultId = extendedResults[0]?.id;

    if (firstExtendedResultId) {
      console.log(firstExtendedResultId, 'extended result found');
      results =
        (await searchAnime(firstExtendedResultId).catch(console.error)) || [];
    }
  }

  return results;
};

// Check number of episodes in an anime
// export const checkEpisode = async (animeId: string, numOfEpisodes: number) => {
//   const doc = getDoc(`${baseURL}/videos/${animeId}-episode-${numOfEpisodes}`);
// };
