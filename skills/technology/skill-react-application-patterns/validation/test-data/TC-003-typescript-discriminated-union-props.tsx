import React from 'react';

// ❌ Flawed: Ambiguous multiple optional flags allowing impossible state combinations
interface FlawedNotificationBannerProps {
  isSuccess?: boolean;
  isError?: boolean;
  isWarning?: boolean;
  errorMessage?: string;
  successTitle?: string;
  warningNote?: string;
}

export function FlawedNotificationBanner(props: FlawedNotificationBannerProps) {
  // Allows isSuccess=true AND isError=true simultaneously; priority is ambiguous and bug-prone
  if (props.isError) {
    return (
      <div role="alert" className="banner error">
        {props.errorMessage}
      </div>
    );
  }
  if (props.isSuccess) {
    return (
      <div role="status" className="banner success">
        {props.successTitle}
      </div>
    );
  }
  if (props.isWarning) {
    return (
      <div role="status" className="banner warning">
        {props.warningNote}
      </div>
    );
  }
  return null;
}

// ✅ Safe: Strict discriminated union guaranteeing mutually exclusive variant props
type SafeNotificationBannerProps =
  | { variant: 'success'; title: string }
  | { variant: 'error'; message: string; onRetry?: () => void }
  | { variant: 'warning'; note: string };

export function SafeNotificationBanner(props: SafeNotificationBannerProps) {
  switch (props.variant) {
    case 'error':
      return (
        <div role="alert" className="banner error">
          <span>{props.message}</span>
          {props.onRetry && <button onClick={props.onRetry}>Retry</button>}
        </div>
      );
    case 'success':
      return (
        <div role="status" className="banner success">
          {props.title}
        </div>
      );
    case 'warning':
      return (
        <div role="status" className="banner warning">
          {props.note}
        </div>
      );
  }
}

