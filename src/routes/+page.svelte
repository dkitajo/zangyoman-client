<script>
	import moment from 'moment';

	import Icon from '@iconify/svelte';
	import WorkdayForm from '$lib/WorkdayForm.svelte';
	import { WorkdayStats, downloadCSV } from '$lib/global.js';
	import { handleWorkdayGET } from '$lib/api';

	// .sever.js からきてる
	export let data = '';

	//デフォルトデータのイニシャライズだべ
	let workdayData = data.props.workdayData;
	let userData = data.props.userData;
	let viewingMonth = data.props.currentMonth;
	let viewingYear = data.props.currentYear;
	let workdayStats = new WorkdayStats(workdayData);

	async function changeMonth(amount) {
		viewingMonth += amount;

		if (viewingMonth > 12) {
			viewingMonth = 1;
			viewingYear += 1;
		} else if (viewingMonth < 1) {
			viewingMonth = 12;
			viewingYear -= 1;
		}
		await handleUpdateWorkdayData();
	}
	async function changeYear(amount) {
		viewingYear += amount;
		await handleUpdateWorkdayData();
	}

	// 日付を変えたらworkdayDataも更新する
	async function handleUpdateWorkdayData() {
		const response = await handleWorkdayGET(viewingMonth, viewingYear);
		workdayData = response.workdayData;
		workdayStats = new WorkdayStats(workdayData);
	}

	// Form関連

	let formBind;

	function updateWorkdayData(newData) {
		workdayData = newData;
		workdayStats = new WorkdayStats(newData);
	}

	// 今日の更新ならテーブルの色を変える
	function isUpdatedToday(date) {
		const todayDateString = moment(new Date()).format('YYYY-MM-DD');
		const updatedDateString = moment(date).format('YYYY-MM-DD');
		return todayDateString === updatedDateString;
	}

	function handleEscape({ key }) {
		if (key === 'Escape') {
			formBind.showModal("", "", "", "", "", 'POST')
			return true;
		}
		return false;
	}
</script>

<svelte:window on:keyup={handleEscape} />

<div class="fixed bottom-4 left-4 z-50">
	<div class="flex flex-col gap-4">
		<div class="tooltip tooltip-top" data-tip="Download CSV">
			<button
				class="btn btn-lg bg-slate-300 hover:scale-110"
				on:click={downloadCSV(workdayData, viewingYear, viewingMonth)}
				><Icon icon="material-symbols:download" width="24" height="24" />
			</button>
		</div>
		<div class="tooltip tooltip-top" data-tip="Enter Time (Esc)">
			<WorkdayForm
				userId={userData.id}
				bind:this={formBind}
				{viewingMonth}
				{viewingYear}
				{updateWorkdayData}
			/>
		</div>
	</div>
</div>

<div class="grid grid-cols-3 justify-center gap-5 grow bg-slate-800 p-4 md:p-8 rounded-b-lg mb-4">
	<div class="stat bg-slate-100 rounded-lg relative">
		<div class="stat-title text-slate-800">合計勤怠時間</div>
		<div class="stat-value text-blue-600 text-2xl md:text-4xl">
			{workdayStats.calTotalHours()}
		</div>
		<div class="stat-desc text-sm md:text-base">
			出勤日数: {workdayStats.calTotalDaysWorked()}
		</div>
		<Icon
			class="absolute bottom-0 right-0 opacity-20 m-1 z-0"
			icon="game-icons:laptop"
			width="100"
			height="100"
		/>
	</div>


	<div class="stat bg-slate-100 rounded-lg relative">
		<div class="stat-title text-slate-800">目標勤務時間</div>
		<div class="stat-value text-green-600 text-2xl md:text-4xl">
			{workdayStats.calTargetHours()}
		</div>
		<div class="stat-desc text-sm md:text-base">
			1日の勤務時間: {workdayStats.regularHoursPerDay}
		</div>
		<Icon
			class="absolute bottom-0 right-0 opacity-20 m-1 z-0"
			icon="game-icons:stairs-goal"
			width="100"
			height="100"
		/>
	</div>

	<div class="stat bg-slate-100 rounded-lg relative">
		<div class="stat-title text-slate-800">調整する時間</div>
		<div
			class="stat-value text-2xl md:text-4xl {workdayStats.isHoursExceeded()
				? 'text-red-600'
				: 'text-yellow-500'}"
		>
			{workdayStats.calOvertimeHours()}
		</div>
		<div class="stat-desc text-sm md:text-base">
			{#if workdayStats.isHoursExceeded()}
				OVERTIME
			{:else}
				勤務時間不足
			{/if}
		</div>
		<Icon
			class="absolute bottom-0 right-0 opacity-20 m-1 z-0"
			icon="fluent-mdl2:breakfast"
			width="100"
			height="100"
		/>
	</div>
</div>

<div class="flex justify-center">
	<div class="stats mr-4 bg-slate-300 my-4">
		<div class="stat place-items-center">
			<div class="stat-title">YEAR</div>
			<div class="stat-value flex item-center gap-3 text-2xl md:text-4xl">
				<button on:click={() => changeYear(-1)} class="btn btn-ghost"
					><Icon icon="icon-park-solid:left-c" color="black" /></button
				>
				{viewingYear}
				<button on:click={() => changeYear(1)} class="btn btn-ghost"
					><Icon icon="icon-park-solid:right-c" color="black" />
				</button>
			</div>
		</div>

		<div class="stat place-items-center">
			<div class="stat-title">MONTH</div>
			<div class="stat-value flex item-center gap-3 text-2xl md:text-4xl">
				<button on:click={() => changeMonth(-1)} class="btn btn-ghost"
					><Icon icon="icon-park-solid:left-c" color="black" /></button
				>
				{viewingMonth}
				<button on:click={() => changeMonth(1)} class="btn btn-ghost"
					><Icon icon="icon-park-solid:right-c" color="black" /></button
				>
			</div>
		</div>
	</div>
</div>

<div id="shifts" class="grid grid-cols-10 gap-2 mt-6 mb-2 sticky top-0">
	<div class="p-2"></div>
	<div class="p-2 col-span-2 font-bold flex item-center justify-center bg-slate-300 rounded-tl-lg">
		Date
	</div>
	<div class="p-2 col-span-2 font-bold flex item-center justify-center bg-slate-300">In</div>
	<div class="p-2 col-span-2 font-bold flex item-center justify-center bg-slate-300">Out</div>
	<div class="p-2 col-span-2 font-bold flex item-center justify-center bg-slate-300 rounded-tr-lg">
		Hours
	</div>
</div>

{#each workdayData as { id, date, start_time, end_time, total_work_hour, last_modified }}
	<div class="grid grid-cols-10 gap-2 content-center group my-2 z-0">
		<div class="flex items-center justify-end">
			{#if isUpdatedToday(last_modified)}
				<Icon icon="material-symbols:fiber-new" color="green" width="36" height="36" />
			{/if}
		</div>
		<div
			class=" px-2 py-4 col-span-2 bg-slate-200 text-gray-800 group-hover:bg-slate-300 flex items-center"
		>
			{date}
		</div>
		<div
			class=" px-2 py-4 col-span-2 bg-slate-200 text-gray-800 group-hover:bg-slate-300 flex items-center"
		>
			{start_time}
		</div>
		<div
			class=" px-2 py-4 col-span-2 bg-slate-200 text-gray-800 group-hover:bg-slate-300 flex items-center"
		>
			{end_time}
		</div>
		<div
			class="px-2 py-4 col-span-2 bg-slate-200 text-gray-800 group-hover:bg-slate-300 flex items-center"
		>
			{total_work_hour}
		</div>

		<div class="hidden group-hover:block relative">
			<div class="flex flex-row items-center absolute inset-y-0 left-0">
				<button
					class="btn btn-sm btn-circle btn-warning mr-2 hover:rotate-45"
					on:click={() =>
						formBind.showModal(id, date, start_time, end_time, total_work_hour, 'PATCH')}
				>
					<Icon icon="mdi:pen" />
				</button>
				<button
					class="btn btn-sm btn-circle btn-error hover:rotate-45"
					on:click={() =>
						formBind.showModal(id, date, start_time, end_time, total_work_hour, 'DELETE')}
				>
					<Icon icon="mdi:delete" />
				</button>
			</div>
		</div>
	</div>
{/each}
