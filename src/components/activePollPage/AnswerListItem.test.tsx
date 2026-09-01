import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AnswerListItem } from './AnswerListItem';

describe('AnswerListItem Component', () => {
  it('given an answer string, when rendered, then displays the answer content with proper text wrapping and scroll classes', () => {
    render(<AnswerListItem answer="This is a test answer" />);

    const item = screen.getByRole('listitem');
    expect(item).toBeInTheDocument();
    expect(item).toHaveTextContent('This is a test answer');
    expect(item.className).toContain('break-words');
    expect(item.className).toContain('overflow-y-auto');
    expect(item.className).toContain('max-h-48');
  });
});
