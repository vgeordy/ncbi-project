import "./skeleton.styles.css";

// Skeleton Component
// This component is used to create visual placeholders while content is loading.
export const SkeletonRow = () => {
  return (
    <div className="skeleton-row">
      <div className="skeleton-title" />
      <div className="skeleton-meta" />
    </div>
  );
};
