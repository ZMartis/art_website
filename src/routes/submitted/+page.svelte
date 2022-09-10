<script lang="ts">
	import { fade } from 'svelte/transition';
	import BaseButton from '$lib/components/base/base_button.svelte';
</script>

<div in:fade={{ duration: 1000, delay: 1001 }} out:fade={{ duration: 1000 }} class="container">
	<h1 class="title">Email Submitted</h1>
	<h2 class="subtitle">Thank you for contacting me. I'll be in touch as soon as possible.</h2>
	<a href="/">
		<BaseButton>Home</BaseButton>
	</a>
</div>

<style>
	/* your mobile styles go here */
	.container {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.title {
		margin: 8rem 0 0;
	}
	.subtitle {
		text-align: center;
	}
	@media (min-width: 768px) {
		/* your tablet styles go here */
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
