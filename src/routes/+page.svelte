<script lang="ts">
  import type { Snippet } from "svelte";
  import { locale, setLocale, t } from "./i18n";
</script>

<h1>Svelte-Intl</h1>
<h2>Locale: {locale.current}</h2>

<label>
  Locale
  <select
    onchange={(e) => {
      setLocale((e.target as HTMLSelectElement)?.value as I18n.Locale);
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

<h1>
  {t("select", {
    name: "Martin",
    gender: "male",
  })}
</h1>
<p>
  {@render t.rich("select", {
    name: "Martin",
    gender: "male",
    link,
    bold,
  })}
</p>

<p>
  {t("filters", {
    filters: undefined,
  })}
</p>
