import { getClient, ResponseType } from '@tauri-apps/api/http';
import { agent, baseURL } from '../utils/constants';
import { getDoc, postDoc } from '../utils/request-to-doc';

export type Quality = '360' | '480' | '720' | '1080';

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

  return Array.from(
    doc.querySelectorAll<HTMLLIElement>('li[data-status="1"][data-video]')
  ).map((l) => l.dataset.video);
};

const generateLinkGoLoad = async (doc: Document) => {
  // todo
};

const generateLinkDood = async (doodId: string) => {
  console.log('generate dood', doodId);

  const refr = `https://dood.to/e/${doodId}`;

  const doodIdDoc = await getDoc(refr);

  if (!doodIdDoc) return null;

  const doodLink = doodIdDoc.querySelector<HTMLAnchorElement>(
    'a[href^="/download]"'
  ).href;

  await new Promise((res) => setTimeout(res, 500));
  if (doodLink) {
    const doodLinkDoc = await getDoc(`https://dood.to${doodLink}`);
    console.log('doodlinddoc', doodLinkDoc);
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

const generateLinkFembed = async (fbId: string, quality: Quality) => {
  console.log('generate fembed', fbId, quality);

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

  if (!Array.isArray(data) || !data.length) return null;

  const link = getVideoQualityMp4Fembed(data, quality);
  const refr = `https://fembed-hd.com/v/${fbId}`;
  return { link, refr };
};

const generateLinkMp4Upload = async (mp4UploadLink: string) => {
  console.log('generate mp4upload', mp4UploadLink);

  const doc = await getDoc(mp4UploadLink, {
    headers: {
      DNT: '1',
    },
  });

  if (!doc) return null;

  const script = Array.from(doc.querySelectorAll('script')).find((s) =>
    s.innerText.startsWith('eval(function(p,a,c,k,e,d)')
  );
  const [, sub, ext, name, path, port] = script.innerText.match(
    /embed\|(.+)\|.+blank.+\|(.+)\|(.+)\|(.+)\|(.+)\|src/
  );
  const link = `https://${sub}.mp4upload.com:${port}/d/${path}/${name}.${ext}`;

  return { link, refr: mp4UploadLink };
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

  let videoLink;
  let doodId, fbId, mp4UploadLink;
  links.forEach((l) => {
    if (!doodId) doodId = l.match(/^https?:\/\/dood.\w+\/e\/(.+)$/)?.[1];
    if (!fbId) fbId = l.match(/^https?:\/\/fembed-hd\.com\/v\/(.+)$/)?.[1];
    if (!mp4UploadLink)
      mp4UploadLink = l.match(
        /^https:\/\/www\.mp4upload\.com\/embed-.+\.html$/
      )?.[0];
  });

  // if (doodId) videoLink = await generateLinkDood(doodId).catch(console.error);
  if (!videoLink && fbId)
    videoLink = await generateLinkFembed(fbId, quality).catch(console.error);
  if (!videoLink && mp4UploadLink)
    videoLink = await generateLinkMp4Upload(mp4UploadLink).catch(console.error);

  return videoLink;
};
