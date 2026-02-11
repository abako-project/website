/**
 * Virto API - Payments
 *
 * Functions for creating, releasing, and managing blockchain payments.
 * Ported from backend/models/adapter.js (virtoAPI object, lines 982-1029).
 */

import { virtoConfig } from '../config';
import { virtoClient, handleVirtoError } from './client';
import type {
  CreatePaymentData,
  CreatePaymentResponse,
  ReleasePaymentData,
  ReleasePaymentResponse,
  AcceptAndPayData,
  AcceptAndPayResponse,
  GetPaymentResponse,
  HealthCheckResponse,
} from './types';

/**
 * Create a new payment on the blockchain.
 *
 * Initiates a payment transaction that locks funds until release conditions are met.
 *
 * @param paymentData - Payment details (amount, recipient, project, milestone, etc.)
 * @returns Payment creation result with paymentId
 * @throws {VirtoApiError} If the request fails
 */
export async function createPayment(
  paymentData: CreatePaymentData
): Promise<CreatePaymentResponse> {
  try {
    const response = await virtoClient.post<CreatePaymentResponse>(
      virtoConfig.endpoints.payments.create,
      paymentData
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'createPayment');
  }
}

/**
 * Release a payment to the recipient.
 *
 * Releases locked funds from escrow to the recipient address.
 * Typically called when milestone conditions are met.
 *
 * @param paymentData - Payment release details (paymentId, etc.)
 * @returns Payment release result with transaction details
 * @throws {VirtoApiError} If the request fails
 */
export async function releasePayment(
  paymentData: ReleasePaymentData
): Promise<ReleasePaymentResponse> {
  try {
    const response = await virtoClient.post<ReleasePaymentResponse>(
      virtoConfig.endpoints.payments.release,
      paymentData
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'releasePayment');
  }
}

/**
 * Accept and pay in a single transaction.
 *
 * Combines acceptance and payment release into one atomic operation.
 * Used for streamlined payment workflows.
 *
 * @param paymentData - Payment acceptance details (paymentId, etc.)
 * @returns Payment result with transaction details
 * @throws {VirtoApiError} If the request fails
 */
export async function acceptAndPay(paymentData: AcceptAndPayData): Promise<AcceptAndPayResponse> {
  try {
    const response = await virtoClient.post<AcceptAndPayResponse>(
      virtoConfig.endpoints.payments.acceptAndPay,
      paymentData
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'acceptAndPay');
  }
}

/**
 * Get payment details by ID.
 *
 * Retrieves the current state and details of a payment transaction.
 *
 * @param paymentId - Unique payment identifier
 * @returns Payment details object
 * @throws {VirtoApiError} If the request fails
 */
export async function getPayment(paymentId: string): Promise<GetPaymentResponse> {
  try {
    const response = await virtoClient.get<GetPaymentResponse>(
      virtoConfig.endpoints.payments.get,
      {
        params: { paymentId },
      }
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, `getPayment(${paymentId})`);
  }
}

/**
 * Health check for the Payments API.
 *
 * @returns Health status object
 * @throws {VirtoApiError} If the request fails
 */
export async function paymentsHealthCheck(): Promise<HealthCheckResponse> {
  try {
    const response = await virtoClient.get<HealthCheckResponse>(
      virtoConfig.endpoints.payments.health
    );
    return response.data;
  } catch (error) {
    handleVirtoError(error, 'paymentsHealthCheck');
  }
}
