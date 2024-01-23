import moment from 'moment';
import { getCurrentMonthYear } from '$lib/global';
import { handleWorkdayGET, userApiUrl } from '$lib/api'

export async function load({ fetch }) {
  const { currentMonth, currentYear } = getCurrentMonthYear();

  try {
    const { workdayData } = await handleWorkdayGET( currentMonth , currentYear);

    // Fetch user data from the API
    const userResponse = await fetch(userApiUrl);
    const userData = await userResponse.json();

    // Return both sets of data to be passed to the layout
    return {
      props: {
        userData,
        workdayData,
        currentMonth,
        currentYear
      },
    };
  } catch (error) {
    console.error('Error fetching data:', error);

    // Return an empty object if an error occurs
    return {
      props: {},
    };
  }
}