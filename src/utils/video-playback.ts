import { Command, open } from '@tauri-apps/api/shell';

export const playEpisode = (
  player: 'vlc' | 'mpv' | 'url' = 'url',
  url: string,
  httpReferer: string
) => {
  let cmd: Command;

  switch (player) {
    case 'vlc':
      cmd = new Command('vlc', [url, `--http-referrer=${httpReferer}`]);
      cmd.spawn();
      break;
    case 'mpv':
      cmd = new Command('vlc', [url, `--http-referrer=${httpReferer}`]);
    default:
      open(url);
      break;
  }
};
