<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click={() => dispatch('toggleNav')}>
	<div>
		<div class="line" />
		<div class="line" />
		<div class="line" />
	</div>
</button>

<style>
	button {
		background: none;
		border: none;
		height: 2.5rem;
		width: 2.5rem;
		padding: 0;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}
	.line {
		width: 1rem;
		height: 0.14rem;
		background-color: black;
		margin: 0.2rem 0;
		border-radius: 50em;
	}
	@media (min-width: 768px) {
		button {
			display: none;
		}
	}
	@media (min-width: 1366px) {
		/* your desktop styles go here */
	}
</style>
