import React, { useState } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

declare function saveFeedbackApi(text: string): Promise<boolean>;

export function FeedbackWidget() {
  const [feedback, setFeedback] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('saving');
    await saveFeedbackApi(feedback);
    setStatus('saved');
  };

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="feedback-text">Feedback</label>
      <input
        id="feedback-text"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <button type="submit" disabled={status === 'saving'}>
        Submit
      </button>
      {status === 'saved' && <p role="status">Thank you for your feedback!</p>}
    </form>
  );
}

// ❌ Flawed: Synchronous assertion immediately following async trigger without waitFor
export async function testFlawedFeedbackSubmission() {
  const user = userEvent.setup();
  render(<FeedbackWidget />);

  await user.type(screen.getByLabelText(/feedback/i), 'Great UI');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  // Flake/Failure: State update is async, getByRole fails immediately before promise resolves
  expect(screen.getByRole('status')).toHaveTextContent(/thank you/i);
}

// ✅ Safe: Uses waitFor or findByRole to synchronize async UI updates
export async function testSafeFeedbackSubmission() {
  const user = userEvent.setup();
  render(<FeedbackWidget />);

  await user.type(screen.getByLabelText(/feedback/i), 'Great UI');
  await user.click(screen.getByRole('button', { name: /submit/i }));

  const statusMsg = await screen.findByRole('status');
  expect(statusMsg).toHaveTextContent(/thank you for your feedback!/i);
}

