import Box from '@suid/material/Box';
import Button from '@suid/material/Button';
import ButtonGroup from '@suid/material/ButtonGroup';
import Card from '@suid/material/Card';
import CardContent from '@suid/material/CardContent';
import Modal from '@suid/material/Modal';
import ToggleButton from '@suid/material/ToggleButton';
import ToggleButtonGroup from '@suid/material/ToggleButtonGroup';
import Typography from '@suid/material/Typography';
import { Component, createSignal, Index, Show } from 'solid-js';
import { getVideoLink, Quality } from '../api/url-processing';
import { playEpisode, Player } from '../utils/video-playback';
import Loading from './Loading';

const EpisodeSelectionModal: Component<{
  animeId: string;
  numOfEpisodes: number;
  onClose: () => void;
}> = ({ animeId, numOfEpisodes, onClose }) => {
  const [quality, setQuality] = createSignal<Quality>('1080');
  const [player, setPlayer] = createSignal<Player>('vlc');

  const [loading, setLoading] = createSignal<boolean>(false);
  const [error, setError] = createSignal<string>(null);

  const play = async (episodeNumber: number) => {
    setError(null);
    setLoading(true);

    const videoLink = await getVideoLink(
      animeId,
      episodeNumber,
      quality()
    ).catch(console.error);

    if (!videoLink) {
      setError('Error getting video link');
      setLoading(false);
      return;
    }

    await playEpisode(
      player(),
      videoLink.link,
      videoLink.refr,
      `${animeId} episode ${episodeNumber}`
    ).catch((err) => {
      console.error(err);
      setError(
        `Error playing episode ${episodeNumber} on ${player()}. Is the player installed?`
      );
    });

    setLoading(false);
  };

  return (
    <Modal open onClose={loading() ? undefined : onClose}>
      <Card
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'background.paper',
          p: 4,
          maxHeight: 500,
          overflowY: 'auto',
        }}
      >
        <CardContent
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Show when={loading()}>
            <Loading />
          </Show>
          <Show when={!loading()}>
            <Show when={error()}>
              <Box
                sx={{ display: 'grid' }}
                alignItems="center"
                justifyContent="center"
              >
                <Typography variant="body1" color="red">
                  {error}
                </Typography>
              </Box>
            </Show>
            <Box sx={{ display: 'grid', rowGap: 1 }}>
              <Typography variant="body1">Player</Typography>
              <ToggleButtonGroup
                exclusive
                // sx={{ height: '10px' }}
                value={player()}
                onChange={(e, newPlayer) => setPlayer(newPlayer)}
              >
                <ToggleButton value="vlc">VLC media player</ToggleButton>
                <ToggleButton value="mpv">MPV</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: 'grid', rowGap: 1 }}>
              <Typography variant="body1">
                Quality{' '}
                <Typography variant="caption">(if available)</Typography>
              </Typography>
              <ToggleButtonGroup
                exclusive
                // sx={{ height: '10px' }}
                value={quality()}
                onChange={(e, newQuality) => setQuality(newQuality)}
              >
                <ToggleButton value="worst">worst</ToggleButton>
                <ToggleButton value="360">360p</ToggleButton>
                <ToggleButton value="480">480p</ToggleButton>
                <ToggleButton value="720">720p</ToggleButton>
                <ToggleButton value="1080">1080p</ToggleButton>
                <ToggleButton value="best">best</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ display: 'grid', rowGap: 1 }}>
              <Typography variant="body1">Select episode</Typography>
              <Box sx={{ display: 'grid' }}>
                <Index each={new Array(Math.ceil(numOfEpisodes / 10))}>
                  {(_, i) => (
                    <ButtonGroup variant="text">
                      <Index
                        each={new Array(Math.min(numOfEpisodes - i * 10, 10))}
                      >
                        {(__, j) => {
                          const episodeNumber = i * 10 + (j + 1);
                          return (
                            <Button
                              sx={{ minWidth: '42px !important' }}
                              onClick={() => play(episodeNumber)}
                            >
                              {episodeNumber}
                            </Button>
                          );
                        }}
                      </Index>
                    </ButtonGroup>
                  )}
                </Index>
              </Box>
            </Box>
          </Show>
        </CardContent>
      </Card>
    </Modal>
  );
};

export default EpisodeSelectionModal;
