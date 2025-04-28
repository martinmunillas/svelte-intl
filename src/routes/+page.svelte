<script lang="ts">
  import { t, setLocale, type Locale, locale } from "$lib";
  import type { Snippet } from "svelte";
</script>

<label>
  Locale
  <select
    onchange={(e) => {
      setLocale((e.target as HTMLSelectElement)?.value as Locale);
    }}
  >
    {#each locale.list as l}
      <option value={l}>{l}</option>
    {/each}
  </select>
</label>

{#snippet link(content: Snippet)}
  <a href="/asdfasdfasd">{@render content()}</a>
{/snippet}

{#snippet bold(content: Snippet)}
  <b>{@render content()}</b>
{/snippet}

<h1>{t("select", {})}</h1>
<p>
  {@render t.rich("select", {
    name: "Martin",
    gender: "male",
    bold,
    link,
  })}
</p>
<h2>{locale.current}</h2>
