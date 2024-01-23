<script>
  import "tailwindcss/tailwind.css";
  import Icon from '@iconify/svelte';

  export let data = '';
let userData = data.props.userData;
</script>

<div class="flex flex-col ">
  <div class="flex justify-center	bg-slate-800 container mx-auto ">
    <div class="text-white font-bold italic -rotate-2 text-lg	p-4 flex flex-row items-center	">
      残業マン
      <Icon icon="twemoji:star" class="mx-2"/>
      {userData.first_name}
    </div>
  </div>

  <div class=" container mx-auto">

      <slot />
  </div>
  <div class="p-4"></div>
</div>


