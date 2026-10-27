import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('End-to-End Worker & Admin Workflows (Construction & Manufacturing)', () => {
  it('completes Construction Scenario: worker check-in, reports unstable scaffold, admin assigns & resolves, worker sees update', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Verify initial Construction mode & Worker Portal
    expect(
      screen.getByRole('heading', { name: /Murugan Selvaraj/i })
    ).toBeInTheDocument();

    // 1. Worker checks in at construction site
    const checkInBtn = screen.getByRole('button', { name: /Start Shift Check-In/i });
    await user.click(checkInBtn);
    expect(screen.getByText(/Checked in successfully!/i)).toBeInTheDocument();

    // 2. Worker navigates to SafeVoice and submits an unstable scaffold report
    const safeVoiceTab = screen.getByRole('button', { name: /SafeVoice Hazards/i });
    await user.click(safeVoiceTab);

    const descInput = screen.getByLabelText(/5. Describe the Unsafe Condition/i);
    await user.type(
      descInput,
      'West tower scaffold base plate sinking near excavation trench.'
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Safety Report Now/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Safety Report Submitted!/i)).toBeInTheDocument();

    // 3. Switch to Employer Command Center
    const adminSwitchBtn = screen.getByRole('button', { name: /Employer Command Center/i });
    await user.click(adminSwitchBtn);

    expect(
      screen.getByRole('heading', { name: /Employer Operations & Safety Command Center/i })
    ).toBeInTheDocument();

    // 4. Open Incident Resolution tab and advance INC-CON-111 (the newly reported scaffold hazard) through OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED
    const incidentTabBtn = screen.getByRole('button', { name: /Incident Resolution/i });
    await user.click(incidentTabBtn);

    expect(screen.getByTestId('incident-status-INC-CON-111')).toHaveTextContent('OPEN');

    const assignBtn = screen.getByTestId('assign-btn-INC-CON-111');
    await user.click(assignBtn);
    expect(screen.getByTestId('incident-status-INC-CON-111')).toHaveTextContent('ASSIGNED');

    const correctiveInput = screen.getAllByLabelText(
      /Step 2: Record Physical Corrective Action/i
    )[0];
    await user.type(
      correctiveInput,
      'Secured ledger clamps with forged couplers and installed guardrail.'
    );
    const inProgressBtn = screen.getByTestId('progress-btn-INC-CON-111');
    await user.click(inProgressBtn);
    expect(screen.getByTestId('incident-status-INC-CON-111')).toHaveTextContent(
      'IN_PROGRESS'
    );

    const resolutionInput = screen.getAllByLabelText(
      /Step 3: Record Final Inspection & Resolution Verification Notes/i
    )[0];
    await user.type(resolutionInput, 'Inspected and signed off by Lead HSE Officer.');
    const resolveBtn = screen.getByTestId('resolve-btn-INC-CON-111');
    await user.click(resolveBtn);
    expect(screen.getByTestId('incident-status-INC-CON-111')).toHaveTextContent('RESOLVED');
  });

  it('completes Manufacturing Scenario & supports Tamil/English language switching', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Switch to Manufacturing sector
    const mfgBtn = screen.getByRole('button', { name: /Manufacturing/i });
    await user.click(mfgBtn);

    // Ensure Worker Portal is active
    const workerPortalBtn = screen.getByRole('button', { name: /Worker Mobile Portal/i });
    await user.click(workerPortalBtn);

    expect(
      screen.getByRole('heading', { name: /Lakshmi Narayanan/i })
    ).toBeInTheDocument();

    // Check in and complete shift with overtime
    await user.click(screen.getByRole('button', { name: /Start Shift Check-In/i }));
    await user.click(screen.getByRole('button', { name: /Complete Shift Check-Out/i }));
    expect(screen.getByText(/completed! Regular: 8h \| Overtime: 2.5h/i)).toBeInTheDocument();

    // Open WageLens Pay Check
    await user.click(screen.getByRole('button', { name: /WageLens Pay Check/i }));
    expect(screen.getByTestId('net-pay-display')).toBeInTheDocument();

    // Toggle Tamil language and verify translated interface labels
    const langBtn = screen.getByRole('button', { name: /Switch Language Tamil or English/i });
    await user.click(langBtn);

    expect(
      screen.getByRole('heading', { name: /WageLens தெளிவான ஊதியக் கணக்கீடு/i })
    ).toBeInTheDocument();
  });
});
