/**
 * CreateProjectPage - New project proposal form
 *
 * Allows clients to create a new project proposal matching the Figma design (161:8033).
 *
 * Features:
 *   - StepperNumeric component on the left (vertical steps: 1-completed, 2-active, 3-pending)
 *   - Two-column form layout matching Figma
 *   - Title + Project Type on left, Summary on right
 *   - Full-width description textarea
 *   - Styled submit button
 *
 * The form uses react-hook-form with zod validation.
 * Enum options are loaded via the useEnums() hook.
 * On submit, calls useCreateProject() mutation.
 * On success, navigates to the newly created project.
 */

import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useEnums } from '@hooks/useEnums';
import { useCreateProject } from '@hooks/useProjects';
import { Label } from '@components/ui/Label';
import { Spinner } from '@components/ui/Spinner';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------

const createProjectSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  summary: z
    .string()
    .max(280, 'Summary must be 280 characters or less')
    .optional()
    .default(''),
  description: z
    .string()
    .min(1, 'Description is required')
    .max(5000, 'Description must be 5000 characters or less'),
  url: z
    .string()
    .url('Must be a valid URL')
    .or(z.literal(''))
    .optional()
    .default(''),
  projectType: z.coerce.number().min(0, 'Please select a project type'),
  budget: z.coerce.number().min(0, 'Please select a budget range'),
  deliveryTime: z.coerce.number().min(0, 'Please select a delivery time'),
  deliveryDate: z.string().min(1, 'Delivery date is required'),
});

type CreateProjectFormData = z.infer<typeof createProjectSchema>;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function CreateProjectPage() {
  const navigate = useNavigate();
  const { data: enums, isLoading: enumsLoading } = useEnums();
  const createProject = useCreateProject();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      summary: '',
      description: '',
      url: '',
      projectType: 0,
      budget: 0,
      deliveryTime: 3,
      deliveryDate: '',
    },
  });

  const summaryValue = watch('summary');
  const summaryLength = summaryValue?.length ?? 0;

  const onSubmit = async (data: CreateProjectFormData) => {
    try {
      const result = await createProject.mutateAsync({
        title: data.title,
        summary: data.summary ?? '',
        description: data.description,
        url: data.url ?? '',
        projectType: data.projectType,
        budget: data.budget,
        deliveryTime: data.deliveryTime,
        deliveryDate: new Date(data.deliveryDate).valueOf(),
      });

      navigate(`/projects/${result.projectId}`);
    } catch {
      // Error is handled by the mutation state (createProject.error)
    }
  };

  // Loading enums
  if (enumsLoading) {
    return (
      <div className="px-8 lg:px-[var(--spacing-22,112px)] py-10">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--base-surface-1,#141414)] px-8 lg:px-[var(--spacing-22,112px)] py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/projects"
          className="flex items-center gap-1 text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] hover:text-[var(--text-dark-primary,#f5f5f5)] transition-colors"
        >
          <i className="ri-arrow-left-line text-lg" />
          <span className="text-sm">Back to Projects</span>
        </Link>
      </div>

      {/* Main layout: Stepper + Content */}
      <div className="flex gap-12">
        {/* Left: StepperNumeric */}
        <div className="hidden lg:block flex-shrink-0">
          <StepperNumeric currentStep={1} />
        </div>

        {/* Right: Form content */}
        <div className="flex-1 max-w-4xl">
          {/* Title outside form container */}
          <h1 className="text-[30px] font-bold leading-[42px] text-[var(--text-dark-primary,#f5f5f5)] mb-8" style={{ fontFamily: 'Inter' }}>
            Let's start with your project description
          </h1>

          {/* Server error message */}
          {createProject.isError && (
            <div className="mb-6 rounded-[var(--radi-6,12px)] border border-red-500/30 bg-red-500/10 p-4">
              <div className="flex items-start gap-3">
                <i className="ri-error-warning-line text-lg text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">
                    Failed to create project
                  </p>
                  <p className="text-sm text-red-400/80 mt-1">
                    {createProject.error?.message || 'An unexpected error occurred.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Form container */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="rounded-[var(--radi-6,12px)] bg-[var(--base-surface-2,#231f1f)] border border-[var(--base-border,#3d3d3d)] p-11">
              <div className="space-y-6">
                {/* Two-column layout: Title + ProjectType on left, Summary on right */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left column */}
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="w-full">
                      <Label htmlFor="title" className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                        Project Title
                      </Label>
                      <input
                        id="title"
                        type="text"
                        placeholder="Enter your project title"
                        className="flex h-10 w-full rounded-md border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-3 py-2 text-sm text-[var(--text-dark-primary,#f5f5f5)] ring-offset-background placeholder:text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('title')}
                      />
                      {errors.title?.message && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.title.message}
                        </p>
                      )}
                    </div>

                    {/* Project Type (Combobox / Select) */}
                    <div className="w-full">
                      <Label htmlFor="projectType" className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                        Project Type
                      </Label>
                      <select
                        id="projectType"
                        className="flex h-10 w-full rounded-md border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-3 py-2 text-sm text-[var(--text-dark-primary,#f5f5f5)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] disabled:cursor-not-allowed disabled:opacity-50"
                        {...register('projectType')}
                      >
                        <option value="">Select a type...</option>
                        {enums?.projectTypes.map((type, index) => (
                          <option key={type} value={index}>
                            {type}
                          </option>
                        ))}
                      </select>
                      {errors.projectType?.message && (
                        <p className="mt-1 text-sm text-red-400">
                          {errors.projectType.message}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right column */}
                  <div>
                    {/* Summary (InputTextArea) */}
                    <div className="w-full">
                      <Label htmlFor="summary" className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                        Short Summary
                      </Label>
                      <textarea
                        id="summary"
                        placeholder="Brief summary of your project (max 280 characters)"
                        className="flex min-h-[120px] w-full rounded-md border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-3 py-2 text-sm text-[var(--text-dark-primary,#f5f5f5)] ring-offset-background placeholder:text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                        {...register('summary')}
                      />
                      <div className="flex items-center justify-between mt-1">
                        {errors.summary?.message ? (
                          <p className="text-sm text-red-400">
                            {errors.summary.message}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span
                          className={`text-xs ${
                            summaryLength > 280
                              ? 'text-red-400'
                              : 'text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]'
                          }`}
                          style={{ fontFamily: 'Inter' }}
                        >
                          {summaryLength}/280
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full-width: Description */}
                <div className="w-full">
                  <Label htmlFor="description" className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                    Project Description
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Provide a detailed description of your project requirements"
                    className="flex min-h-[180px] w-full rounded-md border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-3 py-2 text-sm text-[var(--text-dark-primary,#f5f5f5)] ring-offset-background placeholder:text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    {...register('description')}
                  />
                  {errors.description?.message && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* URL */}
                <div className="w-full">
                  <Label htmlFor="url" className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                    URL (optional)
                  </Label>
                  <input
                    id="url"
                    type="text"
                    placeholder="https://example.com"
                    className="flex h-10 w-full rounded-md border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-3 py-2 text-sm text-[var(--text-dark-primary,#f5f5f5)] ring-offset-background placeholder:text-[var(--text-dark-secondary,rgba(255,255,255,0.7))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('url')}
                  />
                  {errors.url?.message && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.url.message}
                    </p>
                  )}
                </div>

                {/* Budget */}
                <div className="w-full">
                  <Label className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                    Budget (USD)
                  </Label>
                  <div className="space-y-3">
                    {enums?.budgets.map((budget, index) => (
                      <label
                        key={budget}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          value={index}
                          className="h-4 w-4 border-[var(--base-border,#3d3d3d)] text-[var(--state-brand-active,#36d399)] focus:ring-[var(--state-brand-active,#36d399)]"
                          {...register('budget')}
                        />
                        <span className="text-sm text-[var(--text-dark-primary,#f5f5f5)] group-hover:text-[var(--state-brand-active,#36d399)] transition-colors" style={{ fontFamily: 'Inter' }}>
                          {budget}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.budget?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.budget.message}
                    </p>
                  )}
                </div>

                {/* Delivery Time */}
                <div className="w-full">
                  <Label className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                    Delivery Time
                  </Label>
                  <div className="space-y-3">
                    {enums?.deliveryTimes.map((time, index) => (
                      <label
                        key={time}
                        className="flex items-center gap-3 cursor-pointer group"
                      >
                        <input
                          type="radio"
                          value={index}
                          className="h-4 w-4 border-[var(--base-border,#3d3d3d)] text-[var(--state-brand-active,#36d399)] focus:ring-[var(--state-brand-active,#36d399)]"
                          {...register('deliveryTime')}
                        />
                        <span className="text-sm text-[var(--text-dark-primary,#f5f5f5)] group-hover:text-[var(--state-brand-active,#36d399)] transition-colors" style={{ fontFamily: 'Inter' }}>
                          {time}
                        </span>
                      </label>
                    ))}
                  </div>
                  {errors.deliveryTime?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.deliveryTime.message}
                    </p>
                  )}
                </div>

                {/* Delivery Date */}
                <div className="w-full">
                  <Label htmlFor="deliveryDate" className="mb-2 block text-[var(--text-dark-primary,#f5f5f5)]" style={{ fontFamily: 'Inter' }}>
                    Expected delivery date
                  </Label>
                  <input
                    id="deliveryDate"
                    type="datetime-local"
                    className="flex h-10 w-full rounded-md border border-[var(--base-border,#3d3d3d)] bg-[var(--base-surface-1,#141414)] px-3 py-2 text-sm text-[var(--text-dark-primary,#f5f5f5)] ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--state-brand-active,#36d399)] disabled:cursor-not-allowed disabled:opacity-50"
                    {...register('deliveryDate')}
                  />
                  {errors.deliveryDate?.message && (
                    <p className="mt-1 text-sm text-red-400">
                      {errors.deliveryDate.message}
                    </p>
                  )}
                </div>

                {/* Form actions - Submit button aligned to right */}
                <div className="flex items-center justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || createProject.isPending}
                    className="flex items-center justify-center gap-2 h-11 px-6 bg-[var(--state-brand-active,#36d399)] rounded-[var(--radi-6,12px)] border border-[var(--colors-alpha-dark-200,rgba(255,255,255,0.12))] hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {(isSubmitting || createProject.isPending) ? (
                      <>
                        <Spinner size="sm" />
                        <span className="text-lg font-semibold text-[var(--text-light-primary,#141414)]" style={{ fontFamily: 'Inter' }}>
                          Submitting...
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-semibold text-[var(--text-light-primary,#141414)]" style={{ fontFamily: 'Inter' }}>
                        Next: Define Objectives
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// StepperNumeric Component
// ---------------------------------------------------------------------------

interface StepperNumericProps {
  currentStep: number;
}

function StepperNumeric({ currentStep }: StepperNumericProps) {
  const steps = [
    { number: 1, label: 'Project Description', status: currentStep === 1 ? 'active' : currentStep > 1 ? 'completed' : 'pending' },
    { number: 2, label: 'Define Objectives', status: currentStep === 2 ? 'active' : currentStep > 2 ? 'completed' : 'pending' },
    { number: 3, label: 'Review & Submit', status: currentStep === 3 ? 'active' : currentStep > 3 ? 'completed' : 'pending' },
  ];

  return (
    <div className="space-y-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-start gap-4">
          {/* Step number circle */}
          <div className="relative">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 font-bold text-sm ${
                step.status === 'completed'
                  ? 'bg-[var(--state-brand-active,#36d399)] border-[var(--state-brand-active,#36d399)] text-[var(--text-light-primary,#141414)]'
                  : step.status === 'active'
                  ? 'bg-[var(--base-surface-2,#231f1f)] border-[var(--state-brand-active,#36d399)] text-[var(--state-brand-active,#36d399)]'
                  : 'bg-[var(--base-surface-2,#231f1f)] border-[var(--base-border,#3d3d3d)] text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]'
              }`}
              style={{ fontFamily: 'Inter' }}
            >
              {step.status === 'completed' ? (
                <i className="ri-check-line text-lg" />
              ) : (
                step.number
              )}
            </div>

            {/* Connector line (not on last step) */}
            {index < steps.length - 1 && (
              <div
                className={`absolute left-1/2 top-10 w-0.5 h-8 -translate-x-1/2 ${
                  step.status === 'completed'
                    ? 'bg-[var(--state-brand-active,#36d399)]'
                    : 'bg-[var(--base-border,#3d3d3d)]'
                }`}
              />
            )}
          </div>

          {/* Step label */}
          <div className="pt-2">
            <p
              className={`text-sm font-medium ${
                step.status === 'active'
                  ? 'text-[var(--text-dark-primary,#f5f5f5)]'
                  : 'text-[var(--text-dark-secondary,rgba(255,255,255,0.7))]'
              }`}
              style={{ fontFamily: 'Inter' }}
            >
              {step.label}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
