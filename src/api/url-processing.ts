import { getClient, ResponseType } from '@tauri-apps/api/http';
import { agent, baseURL } from '../utils/constants';
import { getDoc, postDoc } from '../utils/request-to-doc';

type Quality = '360' | '480' | '720' | '1080';

const getDownloadPageLink = async (animeId: string, episodeNumber: number) => {
  const doc = await getDoc(
    `${baseURL}/videos/${animeId}-episode-${episodeNumber}`
  );

  if (!doc) return null;

  return doc.querySelector('iframe').src;
};

// player links
const getLinks = async (downloadPageURL: string) => {
  const doc = await getDoc(downloadPageURL);

  if (!doc) return null;

  /**
   * 0: goload.pro          |
   * 1: sbplay2.xyz         | download
   * 2: dood.ws             | best quality
   * 4, 5, 6: mixdrop.co    | other quality
   * 4: hydrax.net          |
   * 5: fembed-hd.com       |
   * 6: www.mp4upload.com   |
   */
  return Array.from(
    doc.querySelectorAll<HTMLLIElement>('li[data-status="1"][data-video]')
  ).map((l) => l.dataset.video);
};

const generateLinkDood = async (links: string[]) => {
  let doodId: string;
  links.find((l) => {
    doodId = l.match(/^https?:\/\/dood.\w+\/e\/(.+)$/)?.[1];
    return doodId;
  });
  const refr = `https://dood.ws/d/${doodId}`;

  let doodLink: string;
  if (doodId) {
    const doodIdDoc = await getDoc(refr);
    console.log('doodLinkDoc', doodIdDoc);
    if (doodIdDoc) {
    }
  }
  await new Promise((res) => setTimeout(res, 500));
  if (doodLink) {
    const doodLinkDoc = await getDoc(`https://dood.ws${doodLink}`);
  }
};

// get link for specified quality
const getVideoQualityMp4Fembed = (
  data: { file: string; label: string; type: string }[],
  quality: Quality
) => {
  const link = data.find((d) => d.label === `${quality}p`)?.file;
  if (!link) {
    console.log(
      `quality ${quality} not found. using ${data[data.length - 1].label}`
    );
    return data[data.length - 1].file;
  }
  return link;
};

const generateLinkFembed = async (links: string[], quality: Quality) => {
  let fbId: string;
  links.find((l) => {
    fbId = l.match(/^https?:\/\/fembed-hd\.com\/v\/(.+)$/)?.[1];
    return fbId;
  });
  if (!fbId) return null;

  const refr = `https://fembed-hd.com/v/${fbId}`;

  const fbIdDoc = await postDoc(
    `https://fembed-hd.com/api/source/${fbId}`,
    undefined,
    {
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
    }
  );

  if (!fbIdDoc) return null;

  const data = JSON.parse(fbIdDoc.body.innerText)?.data;
  console.log('fembed data:', data);

  if (!Array.isArray(data) || !data.length) return null;

  const link = getVideoQualityMp4Fembed(data, quality);
  return { link, refr };
};

export const getVideoLink = async (
  animeId: string,
  episodeNumber: number,
  quality: Quality = '1080'
) => {
  const downloadPageURL = await getDownloadPageLink(animeId, episodeNumber);
  const links = await getLinks(downloadPageURL);

  console.log('links', links);

  if (!links?.length) return null;

  // let i = quality === 'best' ? 2 : 3;
  // let resultLinks;
  // while (i >= 1 && i <= 4 && !resultLinks) {
  //   resultLinks = generateLink(links[i], i);
  // }
  return await generateLinkFembed(links, quality);
};
