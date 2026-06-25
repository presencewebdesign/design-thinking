<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <div id="app" class="min-h-screen bg-slate-50">
    <RouterView />
  </div>
</template>

<style>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--color-slate-300);
  border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-slate-400);
}
</style>
