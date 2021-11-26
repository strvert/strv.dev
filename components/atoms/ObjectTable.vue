<template>
  <table>
    <tbody>
      <tr v-for="datum in data" :key="datum.name">
        <th>{{ datum.name }}</th>
        <td>{{ datum.content }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script lang="ts">
import { defineNuxtComponent, PropType, ref, useNuxt2Meta } from '#app';
export default defineNuxtComponent({
  name: 'object-table',
  props: {
    data: {
      type: Array as PropType<Array<{ name: string; content: string }>>,
      required: true,
    },
  },
});
</script>

<style lang="scss" scoped>
table {
  tbody {
    tr {
      th {
        inline-size: 10em;
        text-align: left;
        // padding-inline-end: 3rem;
      }
    }
  }
}
</style>
