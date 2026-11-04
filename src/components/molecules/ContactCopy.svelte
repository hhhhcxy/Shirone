<script lang="ts">
import Icon from "@components/atoms/display/Icon.svelte";
import K from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { showSnackbar } from "@utils/snackbar";
let { kind, label, value }: {kind: "phone" | "qq" | "email"; label: string; value: string} = $props();
const icons = {phone:"fa7-solid:phone",qq:"fa7-brands:qq",email:"material-symbols:mail-rounded"};
async function copy() {
  try {
    await navigator.clipboard.writeText(value);
    showSnackbar(i18n(K.copySuccess));
  } catch {
    showSnackbar(i18n(K.copyFailed) + " · " + value);
  }
}
</script>
<button type="button" class="m3-state-layer" aria-label={label} title={label} onclick={copy}><Icon icon={icons[kind]} class="text-2xl"/></button>
<style>
button{display:grid;place-items:center;color:var(--primary);width:2.75rem;height:2.75rem;border-radius:var(--shape-corner-full);cursor:pointer}
button:focus-visible{outline:2px solid var(--primary)}
</style>
