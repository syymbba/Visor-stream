/**
 * Pesapal & East African Mobile Money Error Code Parser & Diagnostic Engine
 * Maps raw Pesapal v3, MTN MoMo, Airtel Money, M-Pesa, and Card gateway responses
 * into clear, actionable troubleshooting breakdowns for users.
 */

export type ErrorCategory =
  | 'WALLET_LIMIT'
  | 'USER_ACTION'
  | 'TELCO_NETWORK'
  | 'SECURITY_AUTH'
  | 'SYSTEM_SESSION'
  | 'UNKNOWN';

export interface PesapalErrorBreakdown {
  code: string;
  category: ErrorCategory;
  categoryLabel: string;
  title: string;
  description: string;
  troubleshootingSteps: string[];
  providerTip?: string;
  suggestedAction: 'RETRY' | 'TOP_UP' | 'CHANGE_METHOD' | 'CHECK_PHONE' | 'CONTACT_SUPPORT';
  rawErrorCode?: string | number;
  rawErrorMessage?: string;
  carrierName?: string;
}

/**
 * Parses raw Pesapal transaction status, URL parameters, error objects, and telecom strings
 */
export function parsePesapalError(params: {
  statusCode?: number | string | null;
  statusDescription?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  paymentMethod?: string | null;
  currency?: string | null;
}): PesapalErrorBreakdown {
  const statusDesc = (params.statusDescription || '').toUpperCase();
  const statusCode = Number(params.statusCode);
  const rawErr = (params.errorMessage || '').toLowerCase();
  const errCode = (params.errorCode || '').toUpperCase();
  const method = (params.paymentMethod || '').toUpperCase();
  const currency = (params.currency || 'UGX').toUpperCase();

  // Detect Carrier/Provider accurately
  let carrierName = 'Mobile Money';
  let ussdCode = '*165# (MTN) or *185# (Airtel)';
  if (method.includes('AIRTEL')) {
    carrierName = 'Airtel Money';
    ussdCode = 'Dial *185# to check your Airtel Money wallet balance';
  } else if (method.includes('MTN') || method.includes('MOMO')) {
    carrierName = 'MTN Mobile Money';
    ussdCode = 'Dial *165# to check your MTN MoMo wallet balance';
  } else if (method.includes('MPESA') || method.includes('M-PESA') || currency === 'KES') {
    carrierName = 'Safaricom M-Pesa';
    ussdCode = 'Dial *334# or open the M-Pesa app to check your account';
  } else if (method.includes('CARD') || method.includes('VISA') || method.includes('MASTERCARD')) {
    carrierName = 'Bank Card (Visa / Mastercard)';
    ussdCode = 'Check your mobile banking app or contact your card-issuing bank';
  } else if (currency === 'UGX') {
    carrierName = 'MTN / Airtel Mobile Money';
    ussdCode = 'Dial *165# (MTN) or *185# (Airtel) to check your wallet balance';
  }

  // 1. INSUFFICIENT FUNDS / BALANCE LOW
  if (
    errCode.includes('INSUFFICIENT') ||
    errCode.includes('LOW_BALANCE') ||
    errCode.includes('51') || // ISO 8583 Insufficient funds
    rawErr.includes('insufficient') ||
    rawErr.includes('balance') ||
    rawErr.includes('not enough funds') ||
    rawErr.includes('low balance')
  ) {
    return {
      code: 'INSUFFICIENT_FUNDS',
      category: 'WALLET_LIMIT',
      categoryLabel: 'Wallet Balance Low',
      title: 'Insufficient Mobile Money Balance',
      description: `Your ${carrierName} wallet does not have enough balance to complete this transaction and cover the carrier's standard transaction/USSD fee.`,
      troubleshootingSteps: [
        `Deposit or transfer additional funds into your ${carrierName} wallet.`,
        'Remember to account for the standard 1–2% carrier USSD transaction tax.',
        'Tap "Try Payment Again" once your balance is topped up.',
      ],
      providerTip: ussdCode,
      suggestedAction: 'TOP_UP',
      rawErrorCode: params.errorCode || 'ERR_INSUFFICIENT_FUNDS',
      rawErrorMessage: params.errorMessage || 'Account balance insufficient for transaction amount plus fees',
      carrierName,
    };
  }

  // 2. TIMEOUT / USER DID NOT ENTER PIN
  if (
    errCode.includes('TIMEOUT') ||
    errCode.includes('EXPIRED') ||
    rawErr.includes('timeout') ||
    rawErr.includes('timed out') ||
    rawErr.includes('no response from user') ||
    rawErr.includes('prompt expired') ||
    statusDesc === 'EXPIRED'
  ) {
    return {
      code: 'PIN_PROMPT_TIMEOUT',
      category: 'USER_ACTION',
      categoryLabel: 'Authorization Timeout',
      title: 'Mobile Money PIN Prompt Timed Out',
      description: `The push notification prompt sent to your phone timed out after 60 seconds before your ${carrierName} PIN was entered.`,
      troubleshootingSteps: [
        'Unlock your mobile phone and keep the home screen active.',
        'Click "Try Payment Again" below to trigger a fresh prompt.',
        'Enter your PIN immediately when the telecom popup displays on your phone screen.',
      ],
      providerTip: 'If prompt does not display, check if your phone is in "Do Not Disturb" mode or low cellular signal.',
      suggestedAction: 'RETRY',
      rawErrorCode: params.errorCode || 'ERR_PROMPT_TIMEOUT',
      rawErrorMessage: params.errorMessage || 'USSD/STK push prompt expired before PIN submission',
      carrierName,
    };
  }

  // 3. USER CANCELLED / REJECTED PROMPT
  if (
    errCode.includes('CANCEL') ||
    errCode.includes('USER_CANCELLED') ||
    rawErr.includes('cancelled') ||
    rawErr.includes('canceled') ||
    rawErr.includes('rejected by user') ||
    rawErr.includes('declined by user') ||
    statusDesc === 'CANCELLED'
  ) {
    return {
      code: 'USER_CANCELLED',
      category: 'USER_ACTION',
      categoryLabel: 'Payment Cancelled',
      title: 'Transaction Cancelled on Handset',
      description: `The payment request was dismissed or cancelled from the mobile phone prompt or Pesapal checkout window.`,
      troubleshootingSteps: [
        'Ensure you press "1" (Accept / Authorize) when the carrier prompt appears.',
        'Do not press the phone Back or Lock buttons while the USSD dialogue is active.',
        'Tap "Try Payment Again" to initiate a new checkout session.',
      ],
      providerTip: 'No money has been debited from your mobile money or bank account.',
      suggestedAction: 'RETRY',
      rawErrorCode: params.errorCode || 'ERR_USER_CANCELLED',
      rawErrorMessage: params.errorMessage || 'Transaction cancelled by user or dismissed',
      carrierName,
    };
  }

  // 4. INVALID PIN / WRONG PIN
  if (
    errCode.includes('INVALID_PIN') ||
    errCode.includes('WRONG_PIN') ||
    errCode.includes('55') || // ISO 8583 Incorrect PIN
    rawErr.includes('wrong pin') ||
    rawErr.includes('invalid pin') ||
    rawErr.includes('incorrect pin')
  ) {
    return {
      code: 'INCORRECT_PIN',
      category: 'SECURITY_AUTH',
      categoryLabel: 'Security Authentication',
      title: 'Incorrect Mobile Money PIN Entered',
      description: `The PIN entered on your mobile phone was rejected by ${carrierName}.`,
      troubleshootingSteps: [
        `Carefully re-enter your valid 4 or 5-digit ${carrierName} secret PIN.`,
        'Avoid too many consecutive failed attempts to prevent telecom account lock.',
        'Tap "Try Payment Again" to start a fresh attempt.',
      ],
      providerTip: `If you have forgotten your PIN, use ${carrierName} customer care or ${ussdCode} to reset it.`,
      suggestedAction: 'RETRY',
      rawErrorCode: params.errorCode || 'ERR_WRONG_PIN',
      rawErrorMessage: params.errorMessage || 'The PIN supplied to the mobile money operator was incorrect',
      carrierName,
    };
  }

  // 5. DAILY LIMIT EXCEEDED
  if (
    errCode.includes('LIMIT') ||
    errCode.includes('EXCEEDED') ||
    errCode.includes('61') || // ISO 8583 Exceeds withdrawal limit
    rawErr.includes('limit') ||
    rawErr.includes('maximum daily') ||
    rawErr.includes('exceeded')
  ) {
    return {
      code: 'LIMIT_EXCEEDED',
      category: 'WALLET_LIMIT',
      categoryLabel: 'Transaction Limit',
      title: 'Daily Mobile Money Limit Exceeded',
      description: `This transaction exceeds your daily or per-transaction spending limit set by ${carrierName} / National Bank regulations.`,
      troubleshootingSteps: [
        'Check your daily cumulative transaction volume on your mobile wallet.',
        'Try paying with a smaller amount or use a different payment method (e.g. Visa/Mastercard).',
        `Upgrade your ${carrierName} KYC tier by submitting your National ID at a service center.`,
      ],
      providerTip: ussdCode,
      suggestedAction: 'CHANGE_METHOD',
      rawErrorCode: params.errorCode || 'ERR_LIMIT_EXCEEDED',
      rawErrorMessage: params.errorMessage || 'Transaction exceeds daily or single-transaction limit for account tier',
      carrierName,
    };
  }

  // 6. INVALID PHONE NUMBER / INVALID ACCOUNT
  if (
    errCode.includes('INVALID_PHONE') ||
    errCode.includes('INVALID_ACCOUNT') ||
    errCode.includes('14') || // ISO 8583 Invalid account
    rawErr.includes('invalid phone') ||
    rawErr.includes('msisdn') ||
    rawErr.includes('unregistered') ||
    rawErr.includes('subscriber not found')
  ) {
    return {
      code: 'INVALID_PHONE_NUMBER',
      category: 'USER_ACTION',
      categoryLabel: 'Account Lookup',
      title: 'Unregistered or Invalid Phone Number',
      description: `The phone number provided is not registered for Mobile Money with ${carrierName} or was entered with an incorrect country code.`,
      troubleshootingSteps: [
        'Ensure the phone number matches the selected carrier (e.g. 077/078 for MTN UG, 070/075 for Airtel UG, 07... for Safaricom KE).',
        'Verify your SIM card is fully registered with your National ID for Mobile Money.',
        'Enter your phone number in full international format (e.g., 256770000000 or 254700000000).',
      ],
      providerTip: 'Double-check country code selection (+256 Uganda, +254 Kenya, +255 Tanzania).',
      suggestedAction: 'CHECK_PHONE',
      rawErrorCode: params.errorCode || 'ERR_INVALID_MSISDN',
      rawErrorMessage: params.errorMessage || 'Subscriber number is invalid, unregistered, or carrier mismatch',
      carrierName,
    };
  }

  // 7. TELCO SWITCH / UPSTREAM NETWORK OUTAGE
  if (
    errCode.includes('NETWORK') ||
    errCode.includes('OUTAGE') ||
    errCode.includes('DOWN') ||
    errCode.includes('91') || // ISO 8583 Issuer or switch inoperative
    errCode.includes('96') || // ISO 8583 System malfunction
    rawErr.includes('network') ||
    rawErr.includes('maintenance') ||
    rawErr.includes('switch') ||
    rawErr.includes('unavailable') ||
    rawErr.includes('connection failed')
  ) {
    return {
      code: 'TELCO_NETWORK_ERROR',
      category: 'TELCO_NETWORK',
      categoryLabel: 'Telecom Switch Outage',
      title: 'Telecom Network Switch Delay',
      description: `The ${carrierName} network switch is currently experiencing temporary gateway congestion or scheduled maintenance.`,
      troubleshootingSteps: [
        'Wait 1–2 minutes for telecom network queue clear-up.',
        'Try switching to an alternate Mobile Money network or Visa/Mastercard.',
        'If issues persist, try again shortly or contact support.',
      ],
      providerTip: `${carrierName} upstream servers are temporarily unreachable from the Pesapal switch.`,
      suggestedAction: 'CHANGE_METHOD',
      rawErrorCode: params.errorCode || 'ERR_TELCO_UNAVAILABLE',
      rawErrorMessage: params.errorMessage || 'Upstream carrier switch timed out or returned inoperative status',
      carrierName,
    };
  }

  // 8. CARD DECLINED / 3D SECURE FAILED
  if (
    carrierName.includes('Card') ||
    errCode.includes('3DS') ||
    errCode.includes('CARD_DECLINED') ||
    rawErr.includes('3d secure') ||
    rawErr.includes('otp') ||
    rawErr.includes('declined') ||
    rawErr.includes('cvv')
  ) {
    return {
      code: 'CARD_DECLINED',
      category: 'SECURITY_AUTH',
      categoryLabel: 'Bank Card Declined',
      title: 'Card Payment Declined by Bank',
      description: `Your card-issuing bank declined this transaction during 3D-Secure 2-Factor Authentication or security verification.`,
      troubleshootingSteps: [
        'Check if your card is enabled for international online payments in your banking app.',
        'Ensure the OTP sent to your bank-registered mobile phone was entered correctly.',
        'Alternatively, use MTN Mobile Money, Airtel Money, or Safaricom M-Pesa for instant local checkout.',
      ],
      providerTip: 'Contact your bank to authorize online purchases from Pesapal / CyberSource.',
      suggestedAction: 'CHANGE_METHOD',
      rawErrorCode: params.errorCode || 'ERR_CARD_DECLINED',
      rawErrorMessage: params.errorMessage || 'Bank declined transaction or 3D Secure verification failed',
      carrierName,
    };
  }

  // 9. REVERSED TRANSACTION (status_code 3 or REVERSED)
  if (statusDesc === 'REVERSED' || statusCode === 3 || rawErr.includes('reversed')) {
    return {
      code: 'TRANSACTION_REVERSED',
      category: 'SYSTEM_SESSION',
      categoryLabel: 'Transaction Reversed',
      title: 'Payment Reversed by Operator',
      description: `The transaction was reversed by the mobile money operator or Pesapal settlement switch. Any held funds are returned to your wallet.`,
      troubleshootingSteps: [
        `Check your ${carrierName} SMS statement to confirm the reversal.`,
        'Wait 2 minutes and retry with a new order reference.',
        'If the charge is still showing as deducted, reach out with your Pesapal Tracking ID.',
      ],
      providerTip: 'Reversed funds typically reflect back into your mobile money wallet instantly.',
      suggestedAction: 'RETRY',
      rawErrorCode: params.errorCode || 'STATUS_CODE_3_REVERSED',
      rawErrorMessage: params.errorMessage || 'Transaction marked as REVERSED by Pesapal settlement switch',
      carrierName,
    };
  }

  // 10. INVALID ORDER / EXPIRED ORDER SESSION (status_code 0 or INVALID)
  if (statusDesc === 'INVALID' || statusCode === 0 || rawErr.includes('invalid order')) {
    return {
      code: 'ORDER_INVALID_EXPIRED',
      category: 'SYSTEM_SESSION',
      categoryLabel: 'Session Expired',
      title: 'Order Session Expired or Invalid',
      description: `The payment session reference has expired or was previously settled. A new checkout session must be generated.`,
      troubleshootingSteps: [
        'Click "Try Payment Again" below to generate a new active checkout session.',
        'Complete the payment promptly within 15 minutes of checkout generation.',
      ],
      providerTip: 'Old payment links expire automatically for your account security.',
      suggestedAction: 'RETRY',
      rawErrorCode: params.errorCode || 'STATUS_CODE_0_INVALID',
      rawErrorMessage: params.errorMessage || 'Pesapal order session is invalid, expired, or duplicate',
      carrierName,
    };
  }

  // DEFAULT / GENERIC FAILURE FALLBACK
  return {
    code: 'GENERAL_PAYMENT_FAILURE',
    category: 'UNKNOWN',
    categoryLabel: 'Payment Not Completed',
    title: 'Mobile Money Payment Could Not Settle',
    description: `Pesapal was unable to complete settlement with ${carrierName}. No money was transferred from your account.`,
    troubleshootingSteps: [
      `Check your ${carrierName} phone for any USSD confirmation or alert SMS.`,
      `Ensure you have an active network data connection and sufficient balance.`,
      'Tap "Try Payment Again" to initiate a fresh checkout attempt.',
    ],
    providerTip: ussdCode,
    suggestedAction: 'RETRY',
    rawErrorCode: params.errorCode || (statusCode ? `STATUS_CODE_${statusCode}` : 'ERR_UNSETTLED'),
    rawErrorMessage: params.errorMessage || params.statusDescription || 'Payment transaction did not reach COMPLETED state',
    carrierName,
  };
}
