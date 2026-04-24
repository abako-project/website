import { useParams } from 'react-router-dom';
import { useProject } from '@hooks/useProjects';
import { Spinner } from '@components/ui';
import { Breadcrumbs } from '@components/shared/Breadcrumbs';

export default function DeveloperEvaluationPage() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error } = useProject(id);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const projectTitle = data?.project.title ?? 'Project';

  return (
    <div className="min-h-screen bg-[var(--base-surface-1,#141414)] px-8 py-10 lg:px-14">
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Projects', to: '/projects' },
          { label: projectTitle, to: `/projects/${id ?? ''}` },
          { label: 'Evaluate' },
        ]}
      />

      <h1 className="text-2xl font-bold text-[var(--text-dark-primary,#f5f5f5)]">
        Developer Evaluation
      </h1>
      {error && (
        <p className="mt-3 text-sm text-red-400">{error.message}</p>
      )}
    </div>
  );
}
