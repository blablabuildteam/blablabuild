import { render, screen } from '@testing-library/react';
import { TransformationCard } from '@/components/ui/transformation-card';

describe('TransformationCard', () => {
  const mockProps = {
    problem: 'Test problem',
    solution: 'Test solution',
    index: 0,
  };

  it('renders problem and solution text', () => {
    render(<TransformationCard {...mockProps} />);

    expect(screen.getByText('Test problem')).toBeInTheDocument();
    expect(screen.getByText('Test solution')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <TransformationCard {...mockProps} className="custom-class" />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders with different index values', () => {
    const { rerender } = render(<TransformationCard {...mockProps} index={0} />);
    expect(screen.getByText('Test problem')).toBeInTheDocument();

    rerender(<TransformationCard {...mockProps} index={1} />);
    expect(screen.getByText('Test problem')).toBeInTheDocument();
  });
});
