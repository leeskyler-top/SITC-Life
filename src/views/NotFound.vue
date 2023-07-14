<script setup>

</script>

<template>
    <a-result status="404" title="404" sub-title="对不起，页面没找到">
        <template #extra>
            <a-button type="primary" @click.prevent="$router.push('/')">返回首页</a-button>
        </template>
    </a-result>
</template>

<style scoped>

</style>