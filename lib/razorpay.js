import Razorpay from 'razorpay';

let razorpayInstance = null;

export function getRazorpayInstance() {
  if (typeof window !== 'undefined') {
    // Avoid running on client side
    return null;
  }

  if (!razorpayInstance) {
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // During Next.js static build checks, environment variables might be undefined.
    // We only throw an error if the route is actually executed at runtime.
    if (!keyId || !keySecret) {
      throw new Error('Razorpay credentials NEXT_PUBLIC_RAZORPAY_KEY_ID or RAZORPAY_KEY_SECRET are missing.');
    }

    razorpayInstance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  return razorpayInstance;
}
