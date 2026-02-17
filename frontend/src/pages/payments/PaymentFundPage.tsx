/**
 * PaymentFundPage - Fund project escrow
 *
 * Two-column layout that lets a client lock funds into escrow to start
 * a project. Shows a simplified milestone breakdown on the left and a
 * payment method form on the right.
 *
 * Route: /payments/:id/fund
 *
 * On first visit, the EscrowPaymentModal is shown to explain the escrow
 * system. The modal dismissal is persisted in localStorage.
 *
 * On submit: navigates back to the project detail page.
 * On/off-ramp payment integration comes in a later phase; for now
 * this is a passthrough step. The consultant will then see the
 * "Assign Team" button on the project page (assign_team requires
 * the coordinator's signature, not the client's).
 */

import * as React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { usePayment } from '@hooks/usePayments';
import {
  Button,
  Card,
  CardContent,
  Input,
  Spinner,
  TabsLine,
} from '@components/ui';
import {
  EscrowPaymentModal,
  isEscrowModalDismissed,
} from '@components/features/payments/EscrowPaymentModal';
import { cn } from '@lib/cn';
import type { Milestone } from '@/types/index';
import type { Tab } from '@components/ui/TabsLine';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PAYMENT_TABS: Tab[] = [
  { id: 'card', label: 'Card' },
  { id: 'bank', label: 'Bank Transfer' },
];

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------

interface CardFormState {
  cardHolder: string;
  cardNumber: string;
  expiration: string;
  cvc: string;
  country: string;
}

const INITIAL_CARD_FORM: CardFormState = {
  cardHolder: '',
  cardNumber: '',
  expiration: '',
  cvc: '',
  country: '',
};

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------

function formatCurrency(amount: number): string {
  return `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function getMilestoneBudget(milestone: Milestone): number {
  if (milestone.budget === null || milestone.budget === undefined) return 0;
  const val =
    typeof milestone.budget === 'string'
      ? parseFloat(milestone.budget)
      : milestone.budget;
  return isNaN(val) ? 0 : val;
}

// ---------------------------------------------------------------------------
// PaymentFundPage
// ---------------------------------------------------------------------------

export default function PaymentFundPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = usePayment(id);

  // Payment method tab state
  const [activeTab, setActiveTab] = React.useState<string>('card');

  // Card form state
  const [cardForm, setCardForm] = React.useState<CardFormState>(INITIAL_CARD_FORM);

  // Escrow modal visibility
  const [showEscrowModal, setShowEscrowModal] = React.useState<boolean>(
    () => !isEscrowModalDismissed()
  );

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  function handleCardFieldChange(field: keyof CardFormState) {
    return (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      // Auto-format card number with spaces every 4 digits
      if (field === 'cardNumber') {
        const digits = value.replace(/\D/g, '').slice(0, 16);
        value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      }

      // Auto-format expiration as MM/YY
      if (field === 'expiration') {
        const digits = value.replace(/\D/g, '').slice(0, 4);
        value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
      }

      // CVC: digits only
      if (field === 'cvc') {
        value = value.replace(/\D/g, '').slice(0, 4);
      }

      setCardForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id || !data) return;

    // On/off-ramp payment integration comes in a later phase.
    // For now, this is a passthrough step: the client confirms the escrow
    // and is redirected to the project page. The consultant will then see
    // the "Assign Team" button (assign_team requires coordinator signature).
    navigate(`/projects/${id}`);
  }

  // --------------------------------------------------------------------------
  // Loading / error states
  // --------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Spinner size="lg" />
          <p className="text-[rgba(255,255,255,0.7)]">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="px-8 py-10 lg:px-14">
        <div className="mx-auto max-w-2xl rounded-[12px] border border-red-500/30 bg-[#231f1f] p-8 text-center">
          <i className="ri-error-warning-line mb-3 block text-4xl text-red-400" />
          <h2 className="mb-2 text-xl font-bold text-[#f5f5f5]">
            Failed to load payment details
          </h2>
          <p className="mb-4 text-[rgba(255,255,255,0.7)]">
            {error?.message ?? 'Payment information not found.'}
          </p>
          <div className="flex justify-center gap-3">
            <button
              onClick={() => void refetch()}
              className="rounded-[12px] bg-[#36d399] px-4 py-2 font-medium text-[#141414] transition-shadow hover:shadow-lg"
            >
              Retry
            </button>
            <Link
              to="/payments"
              className="rounded-[12px] border border-[#3d3d3d] px-4 py-2 text-[rgba(255,255,255,0.7)] transition-colors hover:border-[#555]"
            >
              Back to Payments
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const { project } = data;
  const total = project.milestones.reduce(
    (acc, m) => acc + getMilestoneBudget(m),
    0
  );

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------

  return (
    <>
      {/* Escrow explainer modal — shown once per user */}
      <EscrowPaymentModal
        isOpen={showEscrowModal}
        onClose={() => setShowEscrowModal(false)}
      />

      <div
        className="min-h-screen px-8 py-10 lg:px-14"
        style={{ background: 'var(--base-surface-1, #141414)' }}
      >
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-[rgba(255,255,255,0.5)]">
          <Link
            to="/payments"
            className="transition-colors hover:text-[#f5f5f5]"
          >
            Payments
          </Link>
          <span className="mx-2">/</span>
          <Link
            to={`/payments/${project.id}`}
            className="transition-colors hover:text-[#f5f5f5]"
          >
            {project.title}
          </Link>
          <span className="mx-2">/</span>
          <span className="text-[#f5f5f5]">Fund Escrow</span>
        </nav>

        {/* Two-column layout */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* ----------------------------------------------------------------
                LEFT COLUMN — Project Milestones
            ---------------------------------------------------------------- */}
            <div>
              <Card className="rounded-[12px] border-[#3d3d3d] bg-[#231f1f]">
                <CardContent className="p-6">
                  <h2
                    className="text-lg font-semibold text-[#f5f5f5]"
                    style={{ fontFamily: 'Inter' }}
                  >
                    Project Milestones
                  </h2>
                  <p className="mt-1 text-sm text-[rgba(255,255,255,0.6)]">
                    Review milestones and lock funds to start the project
                  </p>

                  {/* Milestone list */}
                  <div className="mt-5">
                    {project.milestones.length === 0 ? (
                      <p className="py-4 text-center text-sm text-[rgba(255,255,255,0.5)]">
                        No milestones defined yet.
                      </p>
                    ) : (
                      project.milestones.map((milestone, index) => (
                        <SimpleMilestoneRow
                          key={milestone.id ?? `ms-${index}`}
                          milestone={milestone}
                          index={index}
                          isLast={index === project.milestones.length - 1}
                        />
                      ))
                    )}
                  </div>

                  {/* Total box */}
                  {project.milestones.length > 0 && (
                    <div className="mt-4 rounded-[8px] border border-[#3d3d3d] px-4 py-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-semibold text-[#f5f5f5]">
                          Total
                        </span>
                        <span className="text-base font-bold text-[#36d399]">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* ----------------------------------------------------------------
                RIGHT COLUMN — Payment Details
            ---------------------------------------------------------------- */}
            <div>
              {/* Floating heading — outside of card */}
              <h2
                className="mb-4 text-lg font-semibold text-[#f5f5f5]"
                style={{ fontFamily: 'Inter' }}
              >
                Payment Details
              </h2>

              <Card className="rounded-[12px] border-[#3d3d3d] bg-[#231f1f]">
                <CardContent className="p-6">
                  {/* Tabs with icons */}
                  <TabsLine
                    tabs={PAYMENT_TABS}
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                  />

                  {/* Tab content */}
                  <div className="mt-6">
                    {activeTab === 'card' ? (
                      <CardPaymentForm
                        form={cardForm}
                        onFieldChange={handleCardFieldChange}
                      />
                    ) : (
                      <BankTransferPlaceholder />
                    )}
                  </div>

                  {/* Submit button */}
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="mt-6 w-full gap-2"
                  >
                    <i className="ri-lock-line" aria-hidden="true" />
                    Lock the Funds and Start the Project
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

interface SimpleMilestoneRowProps {
  milestone: Milestone;
  index: number;
  isLast: boolean;
}

function SimpleMilestoneRow({ milestone, index, isLast }: SimpleMilestoneRowProps) {
  const budget = getMilestoneBudget(milestone);

  return (
    <div
      className={cn(
        'flex items-center justify-between py-3',
        !isLast && 'border-b border-[#3d3d3d]'
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="mb-0.5 text-xs text-[rgba(255,255,255,0.4)]">
          Milestone {index + 1}
        </p>
        <p className="truncate text-sm text-[#f5f5f5]">{milestone.title}</p>
      </div>
      <span className="ml-4 shrink-0 text-sm font-semibold text-[#f5f5f5]">
        {formatCurrency(budget)}
      </span>
    </div>
  );
}

interface CardPaymentFormProps {
  form: CardFormState;
  onFieldChange: (
    field: keyof CardFormState
  ) => (event: React.ChangeEvent<HTMLInputElement>) => void;
}

function CardPaymentForm({ form, onFieldChange }: CardPaymentFormProps) {
  return (
    <div className="space-y-4">
      {/* Card holder */}
      <Input
        label="Card Holder"
        name="cardHolder"
        placeholder="Full name on card"
        value={form.cardHolder}
        onChange={onFieldChange('cardHolder')}
        autoComplete="cc-name"
      />

      {/* Card number */}
      <div className="relative">
        <Input
          label="Card Number"
          name="cardNumber"
          placeholder="1234 5678 9012 3456"
          value={form.cardNumber}
          onChange={onFieldChange('cardNumber')}
          inputMode="numeric"
          maxLength={19}
          autoComplete="cc-number"
        />
        <i
          className="ri-bank-card-line pointer-events-none absolute bottom-2.5 right-3 text-[rgba(255,255,255,0.4)]"
          aria-hidden="true"
        />
      </div>

      {/* Expiration + CVC row */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Expiration"
          name="expiration"
          placeholder="MM/YY"
          value={form.expiration}
          onChange={onFieldChange('expiration')}
          inputMode="numeric"
          maxLength={5}
          autoComplete="cc-exp"
        />
        <Input
          label="CVC"
          name="cvc"
          placeholder="123"
          value={form.cvc}
          onChange={onFieldChange('cvc')}
          inputMode="numeric"
          maxLength={4}
          autoComplete="cc-csc"
        />
      </div>

      {/* Country */}
      <Input
        label="Country"
        name="country"
        placeholder="Select country"
        value={form.country}
        onChange={onFieldChange('country')}
        autoComplete="country-name"
      />
    </div>
  );
}

function BankTransferPlaceholder() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-[8px] border border-[#3d3d3d] bg-[#141414] px-6 py-8 text-center">
      <i
        className="ri-bank-line text-3xl text-[rgba(255,255,255,0.3)]"
        aria-hidden="true"
      />
      <p className="text-sm text-[rgba(255,255,255,0.7)]">
        Bank transfer instructions will be provided after confirmation.
      </p>
    </div>
  );
}
