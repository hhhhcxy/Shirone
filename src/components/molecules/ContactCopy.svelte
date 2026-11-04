<script lang="ts">
import IconButton from "@components/atoms/action/IconButton.svelte";
import Tooltip from "@components/atoms/overlay/Tooltip.svelte";
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
<Tooltip {label} placement="top">
  <IconButton {label} onclick={copy}><Icon icon={icons[kind]} class="text-[1.5rem]"/></IconButton>
</Tooltip>
