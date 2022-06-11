import { Command, open } from '@tauri-apps/api/shell';

export const playEpisode = async (
  player: 'vlc' | 'mpv' | 'url' = 'url',
  url: string,
  httpReferer: string,
  title: string = 'ani-cli-gui'
) => {
  const safeTitle = title.replaceAll(/[^\w\d]/g, '_');
  console.log(`playing ${safeTitle} on ${player}: ${url}`);
  switch (player) {
    case 'vlc':
      await new Command('vlc', [
        url,
        `--http-referrer=${httpReferer}`,
        `--meta-title=${safeTitle}`,
      ]).spawn();
      break;
    case 'mpv':
    default:
      await open(url);
  }
};
