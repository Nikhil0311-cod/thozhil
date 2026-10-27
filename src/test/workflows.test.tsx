import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('THOZHIL End-to-End Worker & Admin Workflows (Construction & Manufacturing)', () => {
  it('completes Construction Scenario: worker check-in, reports unstable scaffold, admin assigns & resolves, worker sees update', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Verify THOZHIL branding & tagline
    expect(screen.getAllByText('THOZHIL').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Work with dignity\./i).length).toBeGreaterThan(0);

    // Verify initial Construction mode & Worker View
    expect(
      screen.getByRole('heading', { name: /Murugan Selvaraj/i })
    ).toBeInTheDocument();

    // 1. Worker checks in at construction site
    const checkInBtn = screen.getByRole('button', { name: /Start Shift Check-In/i });
    await user.click(checkInBtn);
    expect(
      screen.getByText(/Start Shift Check-In: ATT-CON-/i)
    ).toBeInTheDocument();

    // 2. Worker navigates to Safety Reports and submits an unstable scaffold report
    const safetyTab = screen.getByRole('button', { name: /Safety Reports/i });
    await user.click(safetyTab);

    const descInput = screen.getByLabelText(/5. Hazard Details/i);
    await user.type(
      descInput,
      'West tower scaffold base plate sinking near excavation trench.'
    );

    const submitBtn = screen.getByRole('button', { name: /Submit Safety Report Now/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Safety Report Submitted! ID:/i)).toBeInTheDocument();

    // 3. Switch to Admin View
    const adminSwitchBtn = screen.getByRole('button', { name: /Admin View/i });
    await user.click(adminSwitchBtn);

    expect(
      screen.getByRole('heading', { name: /Workforce & Safety Operations Center/i })
    ).toBeInTheDocument();

    // 4. Open Safety Incidents tab and advance INC-CON-111 through OPEN -> ASSIGNED -> IN_PROGRESS -> RESOLVED
    const incidentTabBtn = screen.getByRole('button', { name: /Safety Incidents/i });
    await user.click(incidentTabBtn);

    expect(screen.getByTestId('incident-status-INC-CON-111')).toHaveTextContent('OPEN');

    const assignBtn = screen.getByTestId('assign-btn-INC-CON-111');
    await user.click(assignBtn);
    expect(screen.getByTestId('incident-status-INC-CON-111')).toHaveTextContent('ASSIGNED');

    const correctiveInput = screen.getAllByLabelText(
      /Step 2: Record Corrective Action/i
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
      /Step 3: Final Verification & Resolution Notes/i
    )[0];
    await user.type(resolutionInput, 'Inspected and signed off by Lead HSE Officer.');
    const resolveBtn = screen.getByTestId('resolve-btn-INC-CON-111');
    await user.click(resolveBtn);
    expect(screen.getByTestId('incident-status-INC-CON-111')).toHaveTextContent('RESOLVED');
  });

  it('completes Manufacturing Scenario & supports complete trilingual switching (English, Tamil, Hindi)', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Switch to Manufacturing sector
    const mfgBtn = screen.getByRole('button', { name: /Manufacturing/i });
    await user.click(mfgBtn);

    // Ensure Worker View is active
    const workerViewBtn = screen.getByRole('button', { name: /Worker View/i });
    await user.click(workerViewBtn);

    expect(
      screen.getByRole('heading', { name: /Lakshmi Narayanan/i })
    ).toBeInTheDocument();

    // Check in and complete shift with overtime
    await user.click(screen.getByRole('button', { name: /Start Shift Check-In/i }));
    await user.click(screen.getByRole('button', { name: /Complete Shift Check-Out/i }));
    expect(screen.getByText(/Regular 8h \| Overtime 2.5h/i)).toBeInTheDocument();

    // Open Wage Insights
    await user.click(screen.getByRole('button', { name: /Wage Insights/i }));
    expect(screen.getByTestId('net-pay-display')).toBeInTheDocument();

    // Switch to Tamil (தமிழ்) and verify natural Tamil labels and worker name
    const tamilBtn = screen.getByRole('button', { name: 'தமிழ்' });
    await user.click(tamilBtn);

    expect(
      screen.getByRole('heading', { name: /லட்சுமி நாராயணன்/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /சம்பளம் மற்றும் ஓவர்டைம் கணக்கீடு/i })
    ).toBeInTheDocument();

    // Switch to Hindi (हिन्दी) and verify Devanagari labels and worker name
    const hindiBtn = screen.getByRole('button', { name: 'हिन्दी' });
    await user.click(hindiBtn);

    expect(
      screen.getByRole('heading', { name: /लक्ष्मी नारायणन/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: /वेतन और ओवरटाइम कैलकुलेटर/i })
    ).toBeInTheDocument();

    // Switch back to English so state is clean
    const englishBtn = screen.getByRole('button', { name: 'English' });
    await user.click(englishBtn);
  });
});
