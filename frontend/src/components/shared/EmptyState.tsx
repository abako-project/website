/**
 * EmptyState - Empty state component
 *
 * Displays when lists or data collections are empty.
 * Can include an optional action button.
 */

interface EmptyStateProps {
  icon?: string; // Remixicon class name (e.g., 'ri-folder-line')
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon = 'ri-inbox-line',
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-[#231F1F] flex items-center justify-center">
        <i className={`${icon} text-3xl text-[#9B9B9B]`}></i>
      </div>

      <h3 className="text-xl font-semibold text-[#F5F5F5] mb-2">{title}</h3>

      {description && (
        <p className="text-[#9B9B9B] max-w-md mb-6">{description}</p>
      )}

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 rounded-xl bg-[#36D399] text-[#141414] font-semibold hover:shadow-lg transition-shadow"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
