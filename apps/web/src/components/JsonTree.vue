<script setup lang="ts">
import { computed } from 'vue';
defineOptions({ name: 'JsonTree' });
const props = defineProps<{ value: unknown; label?: string; depth?: number }>();
const depth = computed(() => props.depth ?? 0);
const isObj = computed(() => props.value !== null && typeof props.value === 'object');
const entries = computed(() => isObj.value ? Object.entries(props.value as Record<string, unknown>) : []);
const summary = computed(() => Array.isArray(props.value) ? `[${props.value.length}]` : `{${entries.value.length}}`);
const kind = computed(() => props.value === null ? 'null' : typeof props.value);
</script>

<template>
  <details v-if="isObj" class="json-node" :open="depth < 2">
    <summary><span v-if="label" class="json-key">{{ label }}</span> <span class="json-meta">{{ summary }}</span></summary>
    <div class="json-children">
      <JsonTree v-for="[k, v] in entries" :key="k" :label="k" :value="v" :depth="depth + 1" />
      <span v-if="!entries.length" class="json-meta">vazio</span>
    </div>
  </details>
  <div v-else class="json-leaf">
    <span v-if="label" class="json-key">{{ label }}:</span>
    <span :class="['json-value', `json-${kind}`]">{{ kind === 'string' ? `"${value}"` : String(value) }}</span>
  </div>
</template>
