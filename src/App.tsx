import { createSignal, onCleanup, onMount } from 'solid-js';
import type { Component } from 'solid-js';
import { searchAnime } from './api/searching';
// import * as bootstrap from 'bootstrap';

const App: Component = () => {
  let searchInput: HTMLInputElement;
  const [search, setSearch] = createSignal<string>(null);
  const [animes, setAnimes] = createSignal([]);

  onMount(() => {
    searchInput.focus();
  });

  return (
    <>
      <input
        type="text"
        onInput={(e) => setSearch(e.currentTarget.value)}
        ref={searchInput}
      />
      <button
        type="button"
        onClick={async () => setAnimes(await searchAnime(search()))}
      >
        Search
      </button>
      <pre>{JSON.stringify(animes(), null, '\n')}</pre>
    </>
  );
};

export default App;
