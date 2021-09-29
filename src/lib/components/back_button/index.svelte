<script lang="ts">
	import { goto } from '$app/navigation';

	import { fade } from 'svelte/transition';

	export let route: string;

	const content = '<';
	let textVisible = false;
</script>

<div class="backButtonContainer">
	<div
		class="backButton"
		on:mouseenter={() => {
			textVisible = true;
		}}
		on:mouseleave={() => {
			textVisible = false;
		}}
		on:click={() => goto(route)}
	>
		<div class="triangle" />
	</div>
	{#if textVisible}
		<div
			class="hoverBackButton"
			on:mouseenter={() => {
				textVisible = true;
			}}
			on:mouseleave={() => {
				textVisible = false;
			}}
			on:click={() => goto(route)}
			transition:fade={{ duration: 350 }}
		>
			<div
				class="hoverTriangle"
				style={textVisible ? 'border-right-color: #fff' : ''}
			/>
		</div>
	{/if}
	<p class="onlyOnMobile">Back</p>
	{#if textVisible}
		<p class="notOnMobile" transition:fade={{ duration: 350 }}>Back</p>
	{/if}
</div>

<style>
	/* your mobile styles go here */
	.onlyOnMobile {
		display: block;
	}
	.notOnMobile {
		display: none;
	}
	.backButtonContainer {
		display: flex;
		align-items: center;
		position: relative;
		height: 2rem;
		width: 2rem;
	}
	.backButton {
		border: 2px solid var(--primary-color);
		width: 2rem;
		height: 2rem;
		border-radius: 50em;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		position: absolute;
	}
	.hoverBackButton {
		border: 2px solid var(--primary-color);
		width: 2rem;
		height: 2rem;
		border-radius: 50em;
		cursor: pointer;
		display: flex;
		justify-content: center;
		align-items: center;
		background-color: var(--primary-color);
		position: absolute;
		z-index: 2;
	}

	.triangle {
		--size: 8px;
		box-sizing: content-box;
		width: 0;
		height: 0;
		margin-right: 0.1rem;
		border-top: var(--size) solid transparent;
		border-bottom: var(--size) solid transparent;
		border-right: var(--size) solid var(--primary-color);
	}

	.hoverTriangle {
		--size: 8px;
		box-sizing: content-box;
		width: 0;
		height: 0;
		margin-right: 0.1rem;
		border-top: var(--size) solid transparent;
		border-bottom: var(--size) solid transparent;
		border-right: var(--size) solid var(--white);
	}

	p {
		content: 'Back';
		color: var(--primary-color);
		margin: 0 0 0 2.3rem;
		letter-spacing: 0.1rem;
	}
	@media (min-width: 768px) {
		/* your tablet styles go here */
		.onlyOnMobile {
			display: none;
		}
		.notOnMobile {
			display: block;
		}
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
