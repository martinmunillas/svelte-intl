<script lang="ts">
  import { t, setLocale, type Locale, locale } from "$lib";

  $inspect(locale);
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

<h1>{t("hello")}</h1>
<p>
  {t("select", {
    name: "Martin",
    gender: "female",
  })}
</p>
<h2>{locale.current}</h2>
