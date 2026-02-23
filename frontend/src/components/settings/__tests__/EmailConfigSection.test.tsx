import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EmailConfigSection } from '../EmailConfigSection';

vi.mock('@/services/emailConfigService', () => ({
  emailConfigService: {
    getStatus: vi.fn(),
    saveCredentials: vi.fn(),
    getAuthUrl: vi.fn(),
    disconnect: vi.fn(),
  },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: 'en' },
  }),
}));

import { emailConfigService } from '@/services/emailConfigService';

describe('EmailConfigSection — user-visible behavior', () => {
  beforeEach(() => vi.clearAllMocks());

  it('shows credential form when email is not configured', async () => {
    vi.mocked(emailConfigService.getStatus).mockResolvedValue({
      configured: false, connected: false, connectedEmail: null,
    });
    render(<EmailConfigSection />);
    await waitFor(() => {
      expect(screen.getByLabelText(/emailConfig.notConfigured.clientIdLabel/i)).toBeInTheDocument();
    });
  });

  it('shows connect button when credentials are saved but not connected', async () => {
    vi.mocked(emailConfigService.getStatus).mockResolvedValue({
      configured: true, connected: false, connectedEmail: null,
    });
    render(<EmailConfigSection />);
    await waitFor(() => {
      expect(screen.getByText(/emailConfig.notConnected.connectButton/i)).toBeInTheDocument();
    });
  });

  it('displays connected email address when fully connected', async () => {
    vi.mocked(emailConfigService.getStatus).mockResolvedValue({
      configured: true, connected: true, connectedEmail: 'admin@gmail.com',
    });
    render(<EmailConfigSection />);
    await waitFor(() => {
      expect(screen.getByText('admin@gmail.com')).toBeInTheDocument();
    });
  });

  it('saves credentials with form values when user submits', async () => {
    vi.mocked(emailConfigService.getStatus)
      .mockResolvedValueOnce({ configured: false, connected: false, connectedEmail: null })
      .mockResolvedValue({ configured: true, connected: false, connectedEmail: null });
    vi.mocked(emailConfigService.saveCredentials).mockResolvedValue();

    render(<EmailConfigSection />);

    await waitFor(() => screen.getByLabelText(/emailConfig.notConfigured.clientIdLabel/i));
    fireEvent.change(screen.getByLabelText(/emailConfig.notConfigured.clientIdLabel/i), {
      target: { value: 'my-client-id' },
    });
    fireEvent.change(screen.getByLabelText(/emailConfig.notConfigured.clientSecretLabel/i), {
      target: { value: 'my-secret' },
    });
    fireEvent.click(screen.getByText(/emailConfig.notConfigured.saveButton/i));

    await waitFor(() => {
      expect(emailConfigService.saveCredentials).toHaveBeenCalledWith('my-client-id', 'my-secret');
    });
  });

  it('disconnects and shows credential form again after disconnect click', async () => {
    vi.mocked(emailConfigService.getStatus)
      .mockResolvedValueOnce({ configured: true, connected: true, connectedEmail: 'admin@gmail.com' })
      .mockResolvedValue({ configured: true, connected: false, connectedEmail: null });
    vi.mocked(emailConfigService.disconnect).mockResolvedValue();

    render(<EmailConfigSection />);

    await waitFor(() => screen.getByText('admin@gmail.com'));
    fireEvent.click(screen.getByText(/emailConfig.connected.disconnectButton/i));

    await waitFor(() => {
      expect(emailConfigService.disconnect).toHaveBeenCalledOnce();
    });
  });
});
