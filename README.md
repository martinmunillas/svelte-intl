# svelte-intl
A straightforward internationalization (i18n) library for Svelte 5, leveraging Runes for reactivity and supporting the ICU Message Format for powerful localization features.

## Features
* **Svelte 5 Runes:** Built with Svelte 5's reactive primitives (`$state`, `$derived`).
* **ICU Message Format:** Supports complex translations including plurals, selects, dates, numbers, etc.
* **Type Safety:** Automatically generates a types based on your provided translations.
* **Simple API:** Easy-to-use functions (`t`, `setLocale`) and reactive state (`locale`).
* **Rich Text Translation:** Integrates seamlessly with Svelte Snippets for embedding complex HTML within translations.

## Installation
Install with NPM
```bash
npm i @svelte-intl/svelte-intl
``` 
Install with Yarn
```bash
yarn add @svelte-intl/svelte-intl
```

## Setup

1.  **Create Translation Files:**
    Define your messages using ICU syntax in separate files per locale.

    * `src/lib/translations/en-us.json`:
        ```json
        {
          "hello": "Hello world!",
          "select": "{name}, Click to see <link>{gender, select, male {his} female {her} other {their}} profile</link>.",
          // ... other messages
        };
        ```

    * `src/lib/translations/es-la.ts`:
        ```typescript
        {
          "hello": "¡Hola Mundo!",
          "seeProfile": "{name}, Haz clic para ver <link>su perfil</link>",
          // ... other messages
        };
        ```

2.  **Configure `svelte-intl`:**
    Create an entry point for your i18n configuration, typically in `$lib/i18n/index.ts`. This file will initialize the library and export the necessary functions and state.

    * `src/lib/i18n/index.ts`:
        ```typescript
        import en_us from "../translations/en-us";
        import es_la from "../translations/es-la";
        // Assuming makeI18n is defined in './i18n.svelte.ts' or similar
        import { makeI18n, type GetLocaleType } from "./i18n.svelte";

        // Define the available translation dictionaries
        const translations = {
          "en-us": en_us,
          "es-la": es_la,
        };

        // Initialize i18n with the translations and a default locale
        const i18n = makeI18n(translations, "en-us");

        // Derive the Locale type for type safety
        export type Locale = GetLocaleType<typeof i18n>;

        // Extract the reactive functions and state
        const { t, setLocale, locale } = i18n;

        // Export for use in components
        export { t, setLocale, locale };
        ```

## Usage

Import the exported functions and state into your Svelte components.

```svelte
<script lang="ts">
  import { t, setLocale, type Locale, locale } from "$lib/i18n"; // Adjust path if needed
  import type { Snippet } from "svelte";

  // Example data for rich text
  let name = $state("Martin");
  let gender = $state<"male" | "female" | "other">("male");

  // Snippet definition for rich text injection
  // This snippet will be rendered inside the <link></link> placeholder in the ICU message
  {#snippet link(content: Snippet)}
    <a href="/user/{name}" class="text-blue-600 hover:underline">
      {@render content()}
    </a>
  {/snippet}

</script>

<label>
  Locale:
  <select
    class="border p-1 rounded"
    value={locale.current}
    onchange={(e) => {
      // Update the locale using setLocale
      // The 't' function and 'locale.current' will reactively update
      setLocale((e.target as HTMLSelectElement)?.value as Locale);
    }}
  >
    {#each locale.list as l}
      <option value={l}>{l}</option>
    {/each}
  </select>
</label>

<hr class="my-4">

<h1>{t("hello")}</h1>

<p>
  {@render t.rich("seeProfile", {
    name: name,        // Pass data for placeholders
    gender: gender,
    link: link         // Pass the defined Svelte snippet
  })}
</p>

<h2 class="mt-4">Current Locale: {locale.current}</h2>

<div class="mt-4">
  <button onclick={() => { name = "Alice"; gender = "female"; }} class="p-1 border rounded bg-gray-100">
    Change to Alice
  </button>
  <button onclick={() => { name = "Martin"; gender = "male"; }} class="p-1 border rounded bg-gray-100 ml-2">
    Change to Martin
  </button>
</div>
```
### Explanation
1. Import: Bring `t`, `setLocale`, `locale`, and the `Locale` type from your setup file (`"$lib/i18n"`).
2.  Basic Translation (`t`): Use the `t` function (which behaves like a Rune) directly in your template: `{t("key")}`. It automatically updates when the locale changes via `setLocale`.
3.  Locale Switching:
    - Use `locale.list` to iterate over available locales (e.g., in a dropdown).
    - Use `locale.current` to display the currently active locale or bind it to the switcher's value.
    - Call `setLocale("new-locale")` to change the application's language. The `t` function and `locale.current` will react automatically.
4. Rich Text Translation (t.rich):
   - Define an ICU message in your translation file with placeholders for data and named placeholders for HTML content (e.g., `<link />`).
   - In your Svelte component, define a {#snippet} with a name matching the placeholder in your ICU message (e.g., `{#snippet link(content: Snippet)}`). This snippet receives the text content designated for the link from the ICU message structure (e.g., the words "Click here" if your ICU was `Click <link>here</link>`). Correction based on user's example: The ICU string shown is more complex (`{gender, select, ... <link>...</link> ...}`), the snippet replaces the `<link>...</link>` part.
   - Call `{@render t.rich("key", { dataPlaceholder: value, snippetPlaceholderName: snippetName })}`. Pass regular data and the defined snippet itself as values in the options object. The library renders the translated string, injecting the rendered snippet into the appropriate placeholder.
## API
- `makeI18n(translations: Record<string, Record<string, string>>, defaultLocale: string)`: Factory function to initialize the i18n system. Requires an object mapping locale codes to translation dictionaries and the initial locale code.
- `t(key: string, options?: Record<string, string | number>)`: Reactive Rune. Returns the translated string for the given key in the current locale. Supports basic ICU placeholder replacement (not rich text).
- `t.rich(key: string, options: Record<string, any>)`: Function to handle translations containing rich text (HTML). Returns a renderable object. Options should include data for ICU placeholders and Svelte Snippets matching named placeholders in the ICU string. Use with `{@render ...}`.
- `setLocale(newLocale: Locale)`: Function to change the active locale. Triggers reactivity for `t` and `locale`.
- `locale`: Reactive Rune. Provides an object `{ current: string, list: string[] }` containing the currently active locale code and a list of all available locale codes.
- `Locale`: Exported TypeScript type representing the union of available locale strings (e.g., `"en-us" | "es-la"`).