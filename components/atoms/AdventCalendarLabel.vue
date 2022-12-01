<template>
    <div class="advent-calendar-label">
        <p><a :href="link"> {{ name }} </a> {{ day }}日目</p>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from '@nuxtjs/composition-api';

export default defineComponent({
    props: {
        name: {
            type: String,
            required: true
        },
        link: {
            type: String,
            required: true
        },
        day: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        return {};
    }
});
</script>

<style lang="scss" scoped>
.advent-calendar-label {
    display: inline-block;

    border-radius: 7px;
    background-color: var(--strvdev-palette-3);
    font-weight: bold;
    color: var(--strvdev-palette-1);
    font-size: 14px;

    p {
        margin-inline-start: 1em;
        margin-inline-end: 1em;
        margin-block-start: 0.2em;
        margin-block-end: 0.2em;
    }

    a {
        color: var(--strvdev-palette-1);
    }
}
</style>