"use server";

import { apiFetch } from "@/lib/apiFetch";
import { AddressSingleResponse } from "@/types/address";
import {
  CheckoutResponse,
  StripeCheckoutSessionResponse,
} from "@/types/checkout";
import { CartCalculateResponse, CartResponse } from "@/types/order";
import { revalidatePath } from "next/cache";

export async function getCartCalculation() {
  try {
    const res = await apiFetch<CartCalculateResponse>("/cart/calculate");
    return res?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getCartProduct() {
  try {
    const res = await apiFetch<CartResponse>("/cart");
    return res?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function updateQuantity(productId: string, quantity: number) {
  try {
    const res = await apiFetch(`/cart`, {
      method: "PATCH",
      body: { productId, quantity },
    });
    revalidatePath("/profile/cart");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function removeCartItem(productId: string) {
  try {
    const res = await apiFetch(`/cart`, {
      method: "DELETE",
      body: { productId },
    });
    revalidatePath("/profile/cart");
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function getDefaultAddress() {
  try {
    const res = await apiFetch<AddressSingleResponse>(
      `/address/default?type=shipping`,
    );
    return res?.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function processCheckout(
  shippingAddressId: string,
  markOrderAsGift: boolean,
  redirectUrl: string,
  // shippingCost,
) {
  try {
    const res = await apiFetch<CheckoutResponse>(`/orders/checkout`, {
      method: "POST",
      body: {
        shippingAddressId,
        markOrderAsGift,
        redirectUrl,
        // shippingCost,
      },
    });
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
}

export const processPayment = async (
  orderId: string,
  successUrl: string,
  cancelUrl: string,
) => {
  try {
    const res = await apiFetch<StripeCheckoutSessionResponse>(
      `/stripe/checkout/session`,
      {
        method: "POST",
        body: {
          orderId,
          successUrl,
          cancelUrl,
        },
      },
    );
    return res?.data?.url;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const paymentWithSavedCard = async (
  orderId: string,
  paymentMethodId: string,
) => {
  try {
    const res = await apiFetch<{ success: boolean; message: string }>(
      `/stripe/checkout/intent`,
      {
        method: "POST",
        body: {
          orderId,
          paymentMethodId,
        },
      },
    );
    return res;
  } catch (error) {
    console.error(error);
    throw error;
  }
};