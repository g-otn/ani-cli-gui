import SearchIcon from '@suid/icons-material/Search';
import AppBar from '@suid/material/AppBar';
import Box from '@suid/material/Box';
import Card from '@suid/material/Card';
import CardActionArea from '@suid/material/CardActionArea';
import CardMedia from '@suid/material/CardMedia';
import CircularProgress from '@suid/material/CircularProgress';
import Container from '@suid/material/Container';
import Grid from '@suid/material/Grid';
import IconButton from '@suid/material/IconButton';
import Input from '@suid/material/Input';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';
import type { Component } from 'solid-js';
import { createSignal, For, Show } from 'solid-js';
import { extendedSearch, processSearch, searchAnime } from './api/searching';
import { getVideoLink } from './api/url-processing';
import { playEpisode } from './utils/video-playback';

const App: Component = () => {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [searchValue, setSearchValue] = createSignal<string>(null);
  const [animes, setAnimes] = createSignal<
    Awaited<ReturnType<typeof searchAnime>>
  >([]);

  const onSearch = async () => {
    setLoading(true);

    const results =
      (await processSearch(searchValue()).catch(console.error)) || [];

    setAnimes(results);
    setLoading(false);
  };

  const onClickAnimeCard = async (animeId: string) => {
    setLoading(true);
    const videoLink = await getVideoLink(animeId, 1).catch(console.error);
    console.log('video link', videoLink);
    if (videoLink)
      await playEpisode(
        'vlc',
        videoLink.link,
        videoLink.refr,
        `${animeId} episode 1`
      );
    setLoading(false);
  };

  const validSearchValue = () => searchValue()?.length >= 3;

  return (
    <>
      <Box sx={{ display: 'grid' }} gridTemplateRows="auto 1fr" height="100vh">
        <AppBar position="sticky">
          <Toolbar sx={{ columnGap: 3, paddingTop: 1, paddingBottom: 1 }}>
            <Typography variant="h6">ani-cli-gui</Typography>
            <Input
              placeholder="Search anime"
              sx={{ flexGrow: 1 }}
              autoFocus
              disabled={loading()}
              onInput={(e) => {
                setSearchValue((e.target as HTMLInputElement).value?.trim());
              }}
              onKeyUp={(e) => e.key === 'Enter' && onSearch()}
              inputProps={{
                minLength: 3,
                maxLength: 200,
              }}
            />
            <IconButton
              onClick={onSearch}
              disabled={!validSearchValue() || loading()}
            >
              <SearchIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Show when={loading()}>
          <Box
            sx={{ display: 'grid' }}
            alignItems="center"
            justifyContent="center"
          >
            <CircularProgress />
          </Box>
        </Show>
        <Show when={!loading() && animes().length > 0}>
          <Container>
            <Grid
              container
              p={4}
              spacing={3}
              direction="row"
              alignItems="center"
              justifyContent="center"
              style={{ minHeight: '100vh' }}
            >
              <For each={animes()}>
                {(anime, i) => (
                  <Grid item alignItems="center">
                    <Card
                      sx={{ width: 180 }}
                      onClick={() => onClickAnimeCard(anime.id)}
                    >
                      <CardActionArea sx={{ height: '100%' }}>
                        <Box
                          height={252}
                          sx={{ display: 'flex' }}
                          justifyContent="center"
                        >
                          <CardMedia
                            component="img"
                            image={anime.picture}
                            alt={anime.name}
                          />
                        </Box>
                        <Box
                          p={1}
                          height={60}
                          alignItems="center"
                          justifyContent="center"
                          textAlign="center"
                          sx={{ display: 'grid' }}
                        >
                          <Typography variant="caption" overflow="hidden">
                            {anime.name}
                          </Typography>
                        </Box>
                      </CardActionArea>
                    </Card>
                  </Grid>
                )}
              </For>
            </Grid>
          </Container>
        </Show>
      </Box>
    </>
  );
};

export default App;
