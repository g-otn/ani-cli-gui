import { cli, shell } from '@tauri-apps/api';
import { getClient, ResponseType } from '@tauri-apps/api/http';
import { Command } from '@tauri-apps/api/shell';
import { agent, baseURL } from '../utils/constants';
import { getClosestQuality } from '../utils/quality';
import { getDoc, postDoc } from '../utils/request-to-doc';
import { Parser } from 'm3u8-parser';

export type Quality = 'worst' | '360' | '480' | '720' | '1080' | 'best';

const generateLinkGoload = async (id: string, doc: Document) => {
  if (!id || !doc) return null;
  console.log('Fetching Goload links...');
  const refr = 'https://goload.pro';

  const [, secretKey] = doc
    .querySelector('[class^="wrapper container-"]')
    .className.match(/container-(.+)/);
  const [, iv] = doc
    .querySelector('[class*="videocontent-"]')
    .className.match(/videocontent-(.+)/);
  const secondKey =
    doc.querySelector<HTMLScriptElement>('[data-value]').dataset.value;
  const [, token] = doc.body.className.match(/^container-(.+)/);

  console.debug(secretKey, iv, secondKey, token);
};

const generateLinkDood = async (doodId: string) => {
  if (!doodId) return null;
  console.log('Fetching Doodstream links...');

  const refr = `https://dood.to/e/${doodId}`;

  const doodIdDoc = await getDoc(refr);
  if (!doodIdDoc) return null;

  const doodLink = doodIdDoc.querySelector<HTMLAnchorElement>(
    'a[href^="/download]"'
  ).href;

  await new Promise((res) => setTimeout(res, 700));
  if (doodLink) {
    const doodLinkDoc = await getDoc(`https://dood.to${doodLink}`);
    console.debug('doodlinddoc', doodLinkDoc);
  }
};

const generateLinkFembed = async (fbId: string, quality: Quality) => {
  if (!fbId) return null;
  console.log('Fetching Xstreamcdn links...');

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

  const data: { file: string; label: string; type: string }[] | string =
    JSON.parse(fbIdDoc.body.innerText)?.data;

  if (!Array.isArray(data) || !data.length) return null;

  const closestQuality = getClosestQuality(
    data.map((d) => parseInt(d.label)),
    quality
  );
  const link = data.find((d) => d.label === `${closestQuality}p`).file;
  return { link, refr };
};

const generateLinkMp4Upload = async (mp4UploadLink: string) => {
  if (!mp4UploadLink) return null;
  console.log('Fetching Mp4upload links...');

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

const generateLinkAnimixplay = async (id: string) => {
  if (!id) return null;
  console.log('Fetching Animixplay links...');
  const refr = 'https://animixplay.to';

  const encId = btoa(id);
  const aniId = btoa(`${id}LTXs3GrU8we9O${encId}`);

  // Tauri's http client doesn't allow to intercept redirects, so we have to use curl
  const cmd = new Command('curl-silent-headers', [
    '-s',
    `https://animixplay.to/api/live${aniId}`,
    '-I',
    '-A',
    `"${agent}"`,
  ]);
  const output = await cmd.execute();
  const link = atob(output.stdout.match(/^location: .+/im)[0].split('#')[1]);

  return { link, refr };
};

const getDownloadPageLink = async (animeId: string, episodeNumber: number) => {
  const doc = await getDoc(
    `${baseURL}/videos/${animeId}-episode-${episodeNumber}`
  );
  if (!doc) return null;

  const id = new URL(doc.querySelector('iframe').src).searchParams.get('id');
  return `https://goload.pro/streaming.php?id=${id}`; // same url as above but without unnecessary params
};

// player links
const getLinks = async (downloadPageURL: string) => {
  const doc = await getDoc(downloadPageURL);
  if (!doc) return null;

  const links = Array.from(
    doc.querySelectorAll<HTMLLIElement>('li[data-status="1"][data-video]')
  ).map((l) => l.dataset.video);

  return { links, doc };
};

// Fetch m3u8 file and return link to desired quality
const getVideoQualityM3u8 = async (
  { link, refr }: { link: string; refr: string },
  quality: Quality
) => {
  const client = await getClient();
  const m3u8File = (
    await client.get<string>(link, {
      headers: { 'User-Agent': agent, Referer: refr },
      responseType: ResponseType.Text,
    })
  ).data;

  const parser = new Parser();
  parser.push(m3u8File);
  parser.end();

  const closestQuality = getClosestQuality(
    parser.manifest.playlists.map((p) => p.attributes.RESOLUTION.height),
    quality
  );
  const uri = parser.manifest.playlists.find(
    (p) => p.attributes.RESOLUTION.height === closestQuality
  ).uri;
  if (uri.startsWith('http')) return uri;

  const linkClosestQuality = new URL(link);

  if (uri.startsWith('/')) {
    linkClosestQuality.pathname = uri;
    return linkClosestQuality.toString();
  }

  // uri is only file name, replace last part of URL path
  linkClosestQuality.pathname = linkClosestQuality.pathname.replace(
    /(.*)\/(.*)$/,
    `$1/${uri}`
  );

  return linkClosestQuality.toString();
};

export const getVideoLink = async (
  animeId: string,
  episodeNumber: number,
  quality: Quality = '1080'
) => {
  const downloadPageURL = await getDownloadPageLink(animeId, episodeNumber);
  const id = new URL(downloadPageURL).searchParams.get('id');

  const { links, doc } = await getLinks(downloadPageURL);
  console.debug('links', links);
  if (!links?.length) return null;

  let videoLink: { link: string; refr: string } | void;
  let doodId, fbId, mp4UploadLink;
  links.forEach((l) => {
    if (!doodId) doodId = l.match(/^https?:\/\/dood.\w+\/e\/(.+)$/)?.[1];
    if (!fbId) fbId = l.match(/^https?:\/\/fembed-hd\.com\/v\/(.+)$/)?.[1];
    if (!mp4UploadLink)
      mp4UploadLink = l.match(
        /^https:\/\/www\.mp4upload\.com\/embed-.+\.html$/
      )?.[0];
  });

  const providers = [
    // () => generateLinkDood(doodId).catch(console.error),
    () => generateLinkAnimixplay(id).catch(console.error),
    // () => generateLinkGoload(id, doc).catch(console.error)
    () => generateLinkFembed(fbId, quality).catch(console.error),
    () => generateLinkMp4Upload(mp4UploadLink).catch(console.error),
  ];

  for (const p of providers) {
    videoLink = await p();
    if (videoLink) break;
  }

  if (!videoLink) return null;

  if (videoLink.link.includes('m3u8')) {
    const m3u8QualityLink: string = await getVideoQualityM3u8(
      videoLink,
      quality
    ).catch(console.error);
    if (m3u8QualityLink) {
      videoLink.link = m3u8QualityLink;
    }
  }

  return videoLink;
};
