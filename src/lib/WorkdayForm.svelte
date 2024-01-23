<script>
	import moment from 'moment';
	import Icon from '@iconify/svelte';
	import { onMount } from 'svelte';
	import {
		handleWorkdayGET,
		handleWorkdayPOST,
		handleWorkdayPATCH,
		handleWorkdayDELETE
	} from '$lib/api';

	export let userId = '';
	// フォームを新規投稿、編集、削除モードに編集するかの判断
	let mode = 'POST';

	// FORMのOPENとCLOSEの関数を抜き取るために使う
	let form_modal;

	// 親コンポーネントに更新したworkdayDataを送る関数
	export let updateWorkdayData;

	export let viewingMonth = '';
	export let viewingYear = '';

	// Date Update
	let todayDate = moment(new Date()).format('YYYY/MM/DD');

	function updateDate() {
		formState.date = todayDate;
	}

	// FORMデフォルト値
	let defaultFormState = {
		id: '',
		date: '',
		start_time: '',
		end_time: '',
		total_work_hour: '',
		user: ''
	};

	// 実際にユーザーが書き込むフォーム
	let formState = { ...defaultFormState };

	// Propでもらってきたら更新
	function setFormState() {
		formState.user = userId;
	}

	setFormState();

	function resetFormState() {
		formState = { ...defaultFormState };
		formState.user = userId;
		updateDate();
		updateFormMode('POST');
	}

	function calculateTotalHours() {
		const inMoment = moment(formState.start_time, 'HH:mm');
		let outMoment = moment(formState.end_time, 'HH:mm');

		if (inMoment.isValid() && outMoment.isValid()) {
			if (outMoment.isBefore(inMoment)) {
				// If outMoment is set to AM, assume it's the next day morning
				outMoment.add(1, 'day');
			}

			const duration = moment.duration(outMoment.diff(inMoment));
			const hours = Math.floor(duration.asHours());
			const minutes = duration.minutes();
			formState.total_work_hour = `${hours.toString().padStart(2, '0')}:${minutes
				.toString()
				.padStart(2, '0')}`;
		} else {
			formState.total_work_hour = ''; // Clear total_work_hour if invalid times
		}
	}

	// 勤怠時間の差分をリアクティブに自動計算や
	$: if (formState.start_time && formState.end_time) {
		calculateTotalHours();
	}

	// API Handler

	async function handleWorkdayOperation(apiFunction, onSuccessMessage) {
		try {
			await apiFunction();
			closeModal();
		} catch (error) {
			console.error(`Error ${onSuccessMessage.toLowerCase()}ing data:`, error);
		} finally {
			// Update workdayData after API call
			let data = await handleWorkdayGET(viewingMonth, viewingYear);
			updateWorkdayData(data?.workdayData);
		}
	}

	async function handleWorkdayPost() {
		await handleWorkdayOperation(() => handleWorkdayPOST(formState), 'Sending data');
	}

	async function handleWorkdayPatch() {
		await handleWorkdayOperation(
			() => handleWorkdayPATCH(formState.id, formState),
			'Updating data'
		);
	}

	async function handleWorkdayDelete() {
		await handleWorkdayOperation(() => handleWorkdayDELETE(formState.id), 'Deleting data');
	}

	function updateFormMode(method) {
		mode = method;
	}

	export function showModal(id, date, start_time, end_time, total_work_hour, mode) {
		updateFormMode(mode);

		if (form_modal) {
			form_modal.showModal();
			formState = { id, date, start_time, end_time, total_work_hour };
		}

		if (mode === 'POST') {
			resetFormState();
		}
	}

	export function closeModal() {
		if (form_modal) {
			form_modal.close();
		}
	}

	function formTitle(mode) {
		return mode === 'POST'
			? '新規作成'
			: mode === 'PATCH'
				? '勤怠データの編集'
				: mode === 'DELETE'
					? '勤怠データの削除'
					: 'モードが選択されていません';
	}



	onMount(() => {
		form_modal = document.getElementById('form_modal');
	});
</script>

<button
	class="btn btn-secondary btn-lg hover:scale-110"
	on:click={showModal}
	on:click={() => resetFormState()}
>
	<Icon icon="mdi:t-rex" width="24" height="24" />
</button>

<dialog id="form_modal" class="modal">
	<div class="modal-box">
		<h3 class="font-bold text-lg">{formTitle(mode)}</h3>
		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Date</span>
			</div>
			<input type="text" class="input input-bordered w-full" bind:value={formState.date} disabled={mode==="DELETE"}/>
		</label>

		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">In</span>
			</div>
			<input
				class="input input-bordered w-full"
				type="time"
				id="inTime"
				bind:value={formState.start_time}
				step="300"
				disabled={mode==="DELETE"}
				required
			/>
		</label>

		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Out</span>
			</div>
			<input
				class="input input-bordered w-full"
				type="time"
				id="outTime"
				bind:value={formState.end_time}
				min="09:00"
				max="18:00"
				step="300"
				disabled={mode==="DELETE"}
				required
			/>

			<div class="label"></div>
		</label>

		<label class="form-control w-full">
			<div class="label">
				<span class="label-text">Hours(自動計算)</span>
			</div>
			<input
				type="text"
				placeholder=""
				class="input input-bordered w-full"
				bind:value={formState.total_work_hour}
				disabled={mode==="DELETE"}
				readonly
			/>
			<div class="label"></div>
		</label>

		<div class="flex justify-end gap-4">
			<button class="btn" on:click={() => closeModal()}>キャンセル</button>

			{#if mode === 'POST'}
				<button class="btn btn-primary" on:click={() => handleWorkdayPost()}>確定 </button>
			{:else if mode === 'PATCH'}
				<button class="btn btn-warning" on:click={() => handleWorkdayPatch()}>更新 </button>
			{:else if mode === 'DELETE'}
				<button class="btn btn-error" on:click={() => handleWorkdayDelete()}>削除 </button>
			{/if}
		</div>
	</div>
</dialog>
