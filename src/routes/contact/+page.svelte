<script lang="ts">
	import { page } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { goto } from '$app/navigation';
	import BaseButton from '$lib/components/base/base_button.svelte';
	$: inquiry = $page.url.searchParams.get('inquiry');

	let name = '';
	let email = '';
	$: subject = inquiry ? 'I would like to inquire about ' + inquiry : '';
	let message = '';
	let honeypot = '';

	$: request = 'notStarted';

	async function submit() {
		request = 'inProgress';
		if (honeypot === '') {
			const response = await fetch('https://formspree.io/f/xdobnrnj', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					response: {
						email: email,
						name: name,
						subject: subject,
						message: message
					}
				})
			});
			if (response) {
				goto('/submitted');
			} else {
				request = 'failed';
			}
		}
	}
</script>

<div in:fade={{ duration: 1000, delay: 1001 }} out:fade={{ duration: 1000 }} class="container">
	<div class="card">
		<h1>Contact</h1>
		<form on:submit|preventDefault={submit}>
			<input
				type="text"
				name="contact_me_by_fax_only"
				tabindex="-1"
				autocomplete="off"
				bind:value={honeypot}
				class="ohNoHoney"
			/>
			<input name="name" type="text" bind:value={name} required />
			<label for="name">Name</label>
			<input name="email" type="email" bind:value={email} required />
			<label for="email">Email</label>
			<input name="subject" type="text" required bind:value={subject} />
			<label for="subject">Subject</label>
			<textarea name="message" bind:value={message} />
			<BaseButton type={'submit'} disabled={request === 'inProgress'}>Send</BaseButton>
			{#if request === 'failed'}
				<h2 class="error">Something went wrong. Please try again.</h2>
			{/if}
		</form>
	</div>
</div>

<style>
	/* your mobile styles go here */
	.container {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 4rem;
		width: 100%;
	}
	.card {
		width: 80%;
		max-width: 60rem;
		background-color: white;
		box-shadow: 20px 18px 37px 1px rgba(0, 0, 0, 0.15);
		border: 1px solid #eee;
		padding: 2rem;
		margin: 2rem 0;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}
	form {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		width: 100%;
	}
	input {
		width: 100%;
		border: none;
		border-bottom: 1px solid var(--black);
		outline: none;
	}
	label {
		font-family: 'Open Sans';
		font-size: 0.8rem;
		margin-bottom: 1rem;
		color: var(--grey);
	}
	textarea {
		resize: none;
		width: 100%;
		min-height: 250px;
		margin-bottom: 1rem;
		border: 1px solid black;
	}

	.ohNoHoney {
		position: absolute;
		left: -5000px;
		height: 0;
		width: 0;
		z-index: -1;
	}

	.error {
		color: var(--error-color);
	}
	@media (min-width: 768px) {
		/* your tablet styles go here */
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
