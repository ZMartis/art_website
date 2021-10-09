<script lang="ts">
	import { page } from '$app/stores';
	import BaseButton from '$lib/components/base/base_button.svelte';
	$: inquiry = $page.query.get('inquiry');
</script>

<div class="container">
	<div class="card">
		<h1>Contact</h1>
		<form>
			<input name="email" type="email" required />
			<label for="email">Email</label>
			<input name="name" type="text" required />
			<label for="name">Name</label>
			<input
				name="subject"
				type="text"
				required
				value={inquiry ? 'I would like to inquire about ' + inquiry : ''}
			/>
			<label for="subject">Subject</label>
			<textarea />
			<BaseButton type={'submit'}>Send</BaseButton>
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
	@media (min-width: 768px) {
		/* your tablet styles go here */
	}
	@media (min-widthe: 1366px) {
		/* your desktop styles go here */
	}
</style>
