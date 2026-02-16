import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionChips, type SuggestionChip } from '@/components/ui/suggestion-chips';

describe('SuggestionChips', () => {
  const mockSuggestions: SuggestionChip[] = [
    { id: '1', label: 'Option 1', value: 'Option 1' },
    { id: '2', label: 'Option 2', value: 'Option 2' },
    { id: '3', label: 'Option 3', value: 'Option 3' },
  ];

  const mockOnSelect = jest.fn();

  beforeEach(() => {
    mockOnSelect.mockClear();
  });

  it('renders all suggestions', () => {
    render(
      <SuggestionChips
        suggestions={mockSuggestions}
        onSelect={mockOnSelect}
      />
    );

    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('calls onSelect when a suggestion is clicked', () => {
    render(
      <SuggestionChips
        suggestions={mockSuggestions}
        onSelect={mockOnSelect}
      />
    );

    fireEvent.click(screen.getByText('Option 1'));
    expect(mockOnSelect).toHaveBeenCalledWith(mockSuggestions[0]);
  });

  it('applies selected styling when selectedId matches', () => {
    render(
      <SuggestionChips
        suggestions={mockSuggestions}
        onSelect={mockOnSelect}
        selectedId="1"
      />
    );

    const option1 = screen.getByText('Option 1').closest('button');
    expect(option1).toHaveClass('bg-bla-lime');
  });

  it('applies custom className', () => {
    const { container } = render(
      <SuggestionChips
        suggestions={mockSuggestions}
        onSelect={mockOnSelect}
        className="custom-class"
      />
    );

    expect(container.firstChild).toHaveClass('custom-class');
  });
});
