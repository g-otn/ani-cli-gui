import SearchIcon from '@suid/icons-material/Search';
import AppBar from '@suid/material/AppBar';
import Box from '@suid/material/Box';
import Container from '@suid/material/Container';
import Grid from '@suid/material/Grid';
import IconButton from '@suid/material/IconButton';
import Input from '@suid/material/Input';
import Toolbar from '@suid/material/Toolbar';
import Typography from '@suid/material/Typography';
import { Component, createSignal, For, lazy, Show, Suspense } from 'solid-js';
import { Anime, processSearch } from './api/searching';
import AnimeCard from './components/AnimeCard';
import Loading from './components/Loading';

import icon from '../src-tauri/icons/32x32.png';

const SelectionModal = lazy(() => import('./components/SelectionModal'));

const App: Component = () => {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [error, setError] = createSignal<boolean>(false);

  const [searchValue, setSearchValue] = createSignal<string>(null);
  const [animes, setAnimes] = createSignal<Anime[]>(null);

  const [selectedAnime, setSelectedAnime] = createSignal<Anime>(null);

  const onSearch = async () => {
    setError(false);
    setLoading(true);

    const results = await processSearch(searchValue()).catch((err) => {
      console.error(err);
      setError(true);
    });

    if (results) setAnimes(results);
    setLoading(false);
  };

  const validSearchValue = () => searchValue()?.length >= 3;

  return (
    <>
      <Box sx={{ display: 'grid' }} gridTemplateRows="auto 1fr" height="100vh">
        <AppBar position="sticky" sx={{ backgroundColor: 'background.paper' }}>
          <Toolbar
            sx={{
              columnGap: 3,
              paddingTop: 1,
              paddingBottom: 1,
              alignItems: 'center',
            }}
          >
            <Box component="img" src={icon} maxHeight={32} maxWidth={32} />
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
        <Suspense fallback={Loading}>
          <Show when={!!selectedAnime()}>
            <SelectionModal
              animeId={selectedAnime().id}
              numOfEpisodes={selectedAnime().numOfEpisodes}
              onClose={() => setSelectedAnime(null)}
            />
          </Show>
          <Show when={loading()}>
            <Loading />
          </Show>
          <Show
            when={!loading() && animes() !== null && animes()?.length === 0}
          >
            <Box
              sx={{ display: 'grid' }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h5">No results</Typography>
            </Box>
          </Show>
          <Show when={error()}>
            <Box
              sx={{ display: 'grid' }}
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="h5" color="red">
                Error
              </Typography>
            </Box>
          </Show>
          <Show when={!loading() && animes()?.length > 0}>
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
                      <AnimeCard
                        anime={anime}
                        onClick={() => setSelectedAnime(anime)}
                      />
                    </Grid>
                  )}
                </For>
              </Grid>
            </Container>
          </Show>
        </Suspense>
      </Box>
    </>
  );
};

export default App;
