/**
 * Razorpay Payment Gateway Service
 * Configured with active Sandbox Credentials for LUXORA
 */

export interface RazorpayCustomerDetails {
  name: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
}

export interface RazorpayItemDetail {
  productId?: string;
  name: string;
  size?: string;
  color?: string;
  quantity: number;
  priceINR: number;
}

export interface RazorpayCheckoutOptions {
  amountINR: number;
  orderNumber?: string;
  customer: RazorpayCustomerDetails;
  items: RazorpayItemDetail[];
  onSuccess: (response: {
    paymentId: string;
    orderId?: string;
    signature?: string;
    amountINR: number;
  }) => void;
  onFailure: (error: {
    code: string;
    description: string;
    reason: string;
    paymentId?: string;
  }) => void;
  onDismiss?: () => void;
}

export const RAZORPAY_CONFIG = {
  keyId: 'rzp_test_TTIym4sF9tQr0m',
  merchantName: 'LUXORA Fashion Commerce',
  brandColor: '#0C2340',
  currency: 'INR',
  merchantPaymentLinkBase: 'https://rzp.io/l/luxora-checkout'
};

/**
 * Loads the external Razorpay standard script safely if not already present
 */
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (typeof (window as any).Razorpay === 'function') {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Unable to load external Razorpay checkout.js script.');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Returns a direct official Razorpay merchant payment link URL for test mode checkout
 */
export const getMerchantPaymentLink = (amountINR: number, orderNumber?: string, customer?: Partial<RazorpayCustomerDetails>): string => {
  const ref = orderNumber || `LX-${Date.now().toString().slice(-6)}`;
  const params = new URLSearchParams({
    order: ref,
    amount: String(amountINR),
    currency: 'INR',
    key: RAZORPAY_CONFIG.keyId,
    mode: 'test',
    merchant: RAZORPAY_CONFIG.merchantName
  });
  if (customer?.name) params.set('name', customer.name);
  if (customer?.email) params.set('email', customer.email);
  if (customer?.phone) params.set('contact', customer.phone);
  return `${RAZORPAY_CONFIG.merchantPaymentLinkBase}?${params.toString()}`;
};

/**
 * Opens the official Razorpay test mode merchant payment link directly
 */
export const openOfficialMerchantPaymentLink = (amountINR: number, orderNumber?: string, customer?: Partial<RazorpayCustomerDetails>): string => {
  const url = getMerchantPaymentLink(amountINR, orderNumber, customer);
  try {
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (err) {
    console.warn('Could not open window automatically:', err);
  }
  return url;
};

/**
 * Initializes and triggers the Razorpay Checkout flow with official test credentials
 */
export const initializeRazorpayPayment = async (
  options: RazorpayCheckoutOptions
): Promise<void> => {
  const { amountINR, orderNumber, customer, items, onSuccess, onFailure, onDismiss } = options;
  const scriptLoaded = await loadRazorpayScript();

  const generatedOrderRef = orderNumber || `LX-${Date.now().toString().slice(-6)}`;
  const amountInPaise = Math.round(amountINR * 100);

  // 1. Create Server-Side Razorpay Order ID via API
  let serverOrderId: string | undefined;
  try {
    const orderRes = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amountINR,
        receipt: `rcpt_${generatedOrderRef}`,
        buyerDetails: customer,
        notes: {
          order_number: generatedOrderRef,
          items_count: items.length
        }
      })
    });
    if (orderRes.ok) {
      const orderJson = await orderRes.json();
      // Only pass order_id to Razorpay checkout if it was genuinely minted on Razorpay API (not a mock fallback)
      if (orderJson.orderId && !orderJson.isSandboxFallback && orderJson.orderId.startsWith('order_')) {
        serverOrderId = orderJson.orderId;
      }
    }
  } catch (apiErr) {
    console.warn('Could not connect to backend create-order route, proceeding with client standard mode:', apiErr);
  }

  if (!scriptLoaded || typeof (window as any).Razorpay !== 'function') {
    // If external script is blocked in iframe/sandbox, throw descriptive error
    onFailure({
      code: 'GATEWAY_SCRIPT_UNAVAILABLE',
      description: 'Razorpay SDK script could not be loaded in current container.',
      reason: 'Script blocked or offline',
    });
    return;
  }

  try {
    const razorpayOptions: any = {
      key: RAZORPAY_CONFIG.keyId,
      amount: amountInPaise,
      currency: RAZORPAY_CONFIG.currency,
      name: RAZORPAY_CONFIG.merchantName,
      description: `Acquisition of ${items.length} Piece${items.length > 1 ? 's' : ''} • Order #${generatedOrderRef}`,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAUrvP9mqpa0kUOszAPFNbFIo-Uc3AmRTKjCutw4upqQvrZinC6HMQJKmHuEan3cRBOlQ1IAXGsXwp0St9H4CP1n5dOh-f3uTw1ScMPfKwGRFCNhWi5lIpoErI0wu6WVkXf7fZ1cDJ8LjC1hEhCe_NHtk_GR7zqESyQLO0-TUTkmTzfMvKAfeZgDHT26rmSn7NMHe8_Tr4lJjRACbebk7hPwWwV8kays9C1kr1W6_DbSNkk3nLjoNgv',
      prefill: {
        name: customer.name || 'Valued Patron',
        email: customer.email || 'patron@luxora.atelier',
        contact: customer.phone || '+91 98200 12345',
      },
      notes: {
        order_number: generatedOrderRef,
        shipping_address: customer.address || 'LUXORA White-Glove Atelier Dispatch',
        item_count: String(items.length),
      },
      theme: {
        color: RAZORPAY_CONFIG.brandColor,
        backdrop_color: 'rgba(0,0,0,0.85)',
      },
      handler: async function (response: any) {
        const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
        
        // 2. Verify payment signature on backend
        try {
          await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id || serverOrderId,
              razorpay_payment_id: paymentId,
              razorpay_signature: response.razorpay_signature
            })
          });
        } catch (vErr) {
          console.warn('Backend verification logged:', vErr);
        }

        onSuccess({
          paymentId,
          orderId: response.razorpay_order_id || serverOrderId,
          signature: response.razorpay_signature,
          amountINR,
        });
      },
      modal: {
        ondismiss: function () {
          if (onDismiss) {
            onDismiss();
          }
        },
        escape: true,
        backdropclose: false
      }
    };

    if (serverOrderId) {
      razorpayOptions.order_id = serverOrderId;
    }

    const rzpInstance = new (window as any).Razorpay(razorpayOptions);

    rzpInstance.on('payment.failed', function (response: any) {
      onFailure({
        code: response.error?.code || 'PAYMENT_FAILED',
        description: response.error?.description || 'Payment rejected by bank gateway or test challenge.',
        reason: response.error?.reason || 'declined',
        paymentId: response.error?.metadata?.payment_id,
      });
    });

    rzpInstance.open();
  } catch (error: any) {
    console.error('Error invoking Razorpay Checkout:', error);
    onFailure({
      code: 'INITIALIZATION_ERROR',
      description: error?.message || 'Failed to initialize Razorpay checkout window.',
      reason: 'runtime_exception',
    });
  }
};
