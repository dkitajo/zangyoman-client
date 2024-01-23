import axios from 'axios';
import { getMonthRange } from '$lib/global';
import moment from 'moment';

const apiUrl = 'https://zangyo-db-70d55201e5b9.herokuapp.com/api/workday/';
export const userApiUrl = 'https://zangyo-db-70d55201e5b9.herokuapp.com/api/users/1/';

export async function handleWorkdayGET(month, year) {
  try {
    const currentDate = moment();
    const targetMonth = month || currentDate.month() + 1;
    const targetYear = year || currentDate.year();

    const { formattedFirstDay, formattedLastDay } = getMonthRange(targetMonth, targetYear);

    const response = await axios.get(`${apiUrl}?date__range=${formattedFirstDay}%2C+${formattedLastDay}`);
    const workdayData = response.data;

    return {
      workdayData
    };
  } catch (error) {
    console.error('Error fetching data:', error);
  } 
}

export async function handleWorkdayPOST(formState) {
  try {
    const response = await axios.post(apiUrl, formState, {
      headers: {
        'Content-Type': 'application/json',
      },
      // withCredentials: true,  // Add this line if needed
    });

    console.log('Data sent successfully:', response.data);

    if (response.status === 200) {
    }
  } catch (error) {
    console.error('Error sending data:', error);
  } 
}

export async function handleWorkdayPATCH(id, formState) {
  try {
    const response = await axios.patch(`${apiUrl}${id} ` , formState, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Data sent successfully:', response.data);

    if (response.status === 200) {
    }
  } catch (error) {
    console.error('Error sending data:', error);
  } 
}



export async function handleWorkdayDELETE(id) {
  try {
    const response = await axios.delete(`${apiUrl}${id} `)

    console.log('Data sent successfully:', response.data);

    if (response.status === 200) {
    }
  } catch (error) {
    console.error('Error sending data:', error);
  } 
}