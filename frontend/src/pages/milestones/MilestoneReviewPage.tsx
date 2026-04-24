import { useParams } from 'react-router-dom';
import { useProject } from '@hooks/useProjects';
import { Spinner } from '@components/ui';
import { Breadcrumbs } from '@components/shared/Breadcrumbs';

export default function MilestoneReviewPage() {
  const { id, milestoneId } = useParams<{ id: string; milestoneId: string }>();
  const { data, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const project = data?.project;
  const projectTitle = project?.title ?? 'Project';
  const milestone = project?.milestones.find((item) => String(item.id) === String(milestoneId));
  const milestoneLabel = milestone?.title ?? 'Milestone';

  return (
    <div className="min-h-screen bg-[var(--base-surface-1,#141414)] px-8 py-10 lg:px-14">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Projects', to: '/projects' },
          { label: projectTitle, to: `/projects/${id ?? ''}` },
          { label: 'Milestones', to: `/projects/${id ?? ''}` },
          { label: `Review ${milestoneLabel}` },
        ]}
      />

      <h1 className="text-2xl font-bold text-[var(--text-dark-primary,#f5f5f5)]">
        Milestone Review
      </h1>
      {error && (
        <p className="mt-3 text-sm text-red-400">{error.message}</p>
      )}
    </div>
  );
}
