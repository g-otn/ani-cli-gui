import { Command, open } from '@tauri-apps/api/shell';

export type Player = 'vlc' | 'mpv';

export const getTitle = (name: string, episodeNumber: number) => {
  const safeName = name.replaceAll(/[^\w\d]/g, '_');
  return `${safeName} episode ${episodeNumber}`;
};

export const playEpisode = async (
  player: Player,
  url: string,
  httpReferer: string,
  title: string = 'ani-cli-gui'
) => {
  console.log(`Playing ${title} on ${player}: ${url}`);

  switch (player) {
    case 'vlc':
      await new Command('vlc', [
        url,
        `--http-referrer=${httpReferer}`,
        `--meta-title="${title}"`,
      ]).spawn();
      break;
    case 'mpv':
      await new Command('mpv', [
        url,
        `--referrer=${httpReferer}`,
        `--force-media-title="${title}"`,
      ]).spawn();
      break;
  }
};
