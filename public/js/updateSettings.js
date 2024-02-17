import axios from 'axios';
import { showAlert } from './alerts';

// type: 'password' | 'data'
export const updateSettings = async (data, type) => {
  try {
    const url = `http://localhost:3000/api/v1/users/${type === 'password' ? 'updateMyPassword' : 'updateMe'}`;
    const res = await axios({
      method: 'PATCH',
      url: url,
      data
    });

    if (res.data.status === 'success') {
      showAlert('success', 'User data updated successfully!');
      window.setTimeout(() => {
        location.assign('/me');
      }, 1500);
    }
  } catch (err) {
    showAlert('error', err.response.data.message);
  }
};
