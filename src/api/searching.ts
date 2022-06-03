const baseurl = 'https://goload.pro';
const agent =
  'Mozilla/5.0 (X11; Linux x86_64; rv:99.0) Gecko/20100101 Firefox/99.0';

export const searchAnime = async (search: string) => {
  const keyword = encodeURIComponent(search.replaceAll(' ', '-'));

  const html = await fetch(`${baseurl}/search.html?keyword=${keyword}`, {
    headers: new Headers({
      'User-Agent': agent,
    }),
  }).then((res) => res.text());

  const doc = new DOMParser().parseFromString(html, 'text/html');

  const videoBlocks = doc.querySelectorAll<HTMLAnchorElement>(
    'a[href^="/videos/"]'
  );

  return Array.from(videoBlocks).map((block) => {
    const [, id, lastEp] = block.href.match(/\/videos\/(\S+)-episode-(\d+)$/);
    const img = block.querySelector<HTMLImageElement>('.picture img');
    const picture = img.src;
    const name = img.alt;

    return { id, lastEp: parseInt(lastEp), picture, name };
  });
};

// export const extendedSearch = async (search: string) => {
//   const keyword = encodeURIComponent(search.replaceAll(' ', '-'));
// };
