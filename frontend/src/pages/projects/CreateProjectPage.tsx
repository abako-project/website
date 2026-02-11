/**
 * CreateProjectPage - New project proposal form
 *
 * Allows clients to create a new project proposal by filling in:
 *   - Title (required)
 *   - Summary (optional, max 280 characters)
 *   - Description (required)
 *   - URL (optional)
 *   - Project Type (dropdown from enums)
 *   - Budget (radio group from enums)
 *   - Delivery Time (radio group from enums)
 *   - Delivery Date (date picker)
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
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Label } from '@components/ui/Label';
import { Card, CardContent, CardHeader, CardTitle } from '@components/ui/Card';
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
      <div className="px-8 lg:px-14 py-10">
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-4">
            <Spinner size="lg" />
            <p className="text-muted-foreground">Loading form data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-8 lg:px-14 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to="/projects"
          className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
        >
          <i className="ri-arrow-left-line text-lg" />
          <span className="text-sm">Back to Projects</span>
        </Link>
      </div>

      <div className="max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            New Project Proposal
          </h1>
          <p className="text-muted-foreground">
            Describe your project to get started. A consultant will review your proposal.
          </p>
        </div>

        {/* Server error message */}
        {createProject.isError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6">
            {/* Title */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <Input
                  label="Title"
                  placeholder="Enter your project title"
                  error={errors.title?.message}
                  {...register('title')}
                />

                {/* Summary */}
                <div className="w-full">
                  <Label htmlFor="summary" className="mb-2 block">
                    Summary
                  </Label>
                  <textarea
                    id="summary"
                    placeholder="Brief summary of your project (max 280 characters)"
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    {...register('summary')}
                  />
                  <div className="flex items-center justify-between mt-1">
                    {errors.summary?.message ? (
                      <p className="text-sm text-destructive">
                        {errors.summary.message}
                      </p>
                    ) : (
                      <span />
                    )}
                    <span
                      className={`text-xs ${
                        summaryLength > 280
                          ? 'text-destructive'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {summaryLength}/280
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="w-full">
                  <Label htmlFor="description" className="mb-2 block">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Provide a detailed description of your project requirements"
                    className="flex min-h-[160px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
                    {...register('description')}
                  />
                  {errors.description?.message && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* URL */}
                <Input
                  label="URL"
                  placeholder="https://example.com"
                  error={errors.url?.message}
                  {...register('url')}
                />
              </CardContent>
            </Card>

            {/* Project Type */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Project Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full">
                  <Label htmlFor="projectType" className="mb-2 block">
                    Select project type
                  </Label>
                  <select
                    id="projectType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                    <p className="mt-1 text-sm text-destructive">
                      {errors.projectType.message}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Budget */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Budget (USD)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enums?.budgets.map((budget, index) => (
                    <label
                      key={budget}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        value={index}
                        className="h-4 w-4 border-input text-primary focus:ring-primary"
                        {...register('budget')}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {budget}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.budget?.message && (
                  <p className="mt-2 text-sm text-destructive">
                    {errors.budget.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Delivery Time */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Delivery Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {enums?.deliveryTimes.map((time, index) => (
                    <label
                      key={time}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="radio"
                        value={index}
                        className="h-4 w-4 border-input text-primary focus:ring-primary"
                        {...register('deliveryTime')}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">
                        {time}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.deliveryTime?.message && (
                  <p className="mt-2 text-sm text-destructive">
                    {errors.deliveryTime.message}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Delivery Date */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Delivery Date</CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  type="datetime-local"
                  label="Expected delivery date"
                  error={errors.deliveryDate?.message}
                  {...register('deliveryDate')}
                />
              </CardContent>
            </Card>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 pt-4 pb-8">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmitting || createProject.isPending}
                disabled={isSubmitting || createProject.isPending}
              >
                Submit Proposal
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
