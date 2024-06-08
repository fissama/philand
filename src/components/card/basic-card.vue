<template>
  <div class="flex flex-col items-center justify-center gap-4 p-4 rounded-lg shadow-md">
    <img :src="image" alt="Image" class="w-24 h-24 object-cover rounded-full">
    <h2 class="text-xl font-semibold">{{ title }}</h2>
    <p class="text-gray-500">{{ description }}</p>
  </div>
</template>

<script>
export default {
  props: {
    image: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  },
};
</script>
