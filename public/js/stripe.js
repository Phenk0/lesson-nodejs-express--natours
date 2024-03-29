/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51OlamzBIWVYaColZ7EuOd5IVQAEnXsv1TFzVxORViHVgCUudPHjn3GSEu0NufHZgpfjUUHtefbNDIbJxVvPCfahu00AFKx2ZVf'
  );
  try {
    // 1) Get checkout session from API
    const session = await axios.post(
      `/api/v1/bookings/checkout-session/${tourId}`
    );
    // console.log(session);

    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};
