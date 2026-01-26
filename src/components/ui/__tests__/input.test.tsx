/// <reference types="vitest" />
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Input } from '../input';

describe('Input', () => {
  describe('rendering', () => {
    it('should render with default props', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toBeInTheDocument();
    });

    it('should forward ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });

    it('should apply base classes', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('flex');
      expect(input).toHaveClass('h-10');
      expect(input).toHaveClass('w-full');
      expect(input).toHaveClass('rounded-md');
    });
  });

  describe('types', () => {
    it('should render text input by default', () => {
      render(<Input />);
      const input = screen.getByRole('textbox');
      // Input without type defaults to text (no type attribute is equivalent to type="text")
      expect(input.tagName).toBe('INPUT');
    });

    it('should render email input', () => {
      render(<Input type="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('type', 'email');
    });

    it('should render password input', () => {
      render(<Input type="password" data-testid="password-input" />);
      const input = screen.getByTestId('password-input');
      expect(input).toHaveAttribute('type', 'password');
    });

    it('should render number input', () => {
      render(<Input type="number" data-testid="number-input" />);
      const input = screen.getByTestId('number-input');
      expect(input).toHaveAttribute('type', 'number');
    });

    it('should render search input', () => {
      render(<Input type="search" />);
      const input = screen.getByRole('searchbox');
      expect(input).toHaveAttribute('type', 'search');
    });
  });

  describe('interaction', () => {
    it('should handle onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();
      render(<Input onChange={handleChange} />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'test');

      expect(handleChange).toHaveBeenCalled();
    });

    it('should update value on user input', async () => {
      const user = userEvent.setup();
      render(<Input />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'Hello World');

      expect(input).toHaveValue('Hello World');
    });

    it('should handle focus events', () => {
      const handleFocus = vi.fn();
      render(<Input onFocus={handleFocus} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);

      expect(handleFocus).toHaveBeenCalled();
    });

    it('should handle blur events', () => {
      const handleBlur = vi.fn();
      render(<Input onBlur={handleBlur} />);

      const input = screen.getByRole('textbox');
      fireEvent.focus(input);
      fireEvent.blur(input);

      expect(handleBlur).toHaveBeenCalled();
    });
  });

  describe('states', () => {
    it('should be disabled when disabled prop is true', () => {
      render(<Input disabled />);
      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
      expect(input).toHaveClass('disabled:opacity-50');
    });

    it('should be readonly when readOnly prop is true', () => {
      render(<Input readOnly defaultValue="Read only" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('readonly');
    });

    it('should be required when required prop is true', () => {
      render(<Input required />);
      const input = screen.getByRole('textbox');
      expect(input).toBeRequired();
    });
  });

  describe('attributes', () => {
    it('should apply placeholder', () => {
      render(<Input placeholder="Enter your name" />);
      const input = screen.getByPlaceholderText('Enter your name');
      expect(input).toBeInTheDocument();
    });

    it('should apply defaultValue', () => {
      render(<Input defaultValue="Default text" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('Default text');
    });

    it('should apply name attribute', () => {
      render(<Input name="email" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('name', 'email');
    });

    it('should apply id attribute', () => {
      render(<Input id="my-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('id', 'my-input');
    });

    it('should apply aria attributes', () => {
      render(<Input aria-label="Email address" aria-describedby="email-help" />);
      const input = screen.getByLabelText('Email address');
      expect(input).toHaveAttribute('aria-describedby', 'email-help');
    });

    it('should apply minLength and maxLength', () => {
      render(<Input minLength={3} maxLength={100} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveAttribute('minlength', '3');
      expect(input).toHaveAttribute('maxlength', '100');
    });
  });

  describe('custom className', () => {
    it('should merge custom className with base classes', () => {
      render(<Input className="custom-input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('custom-input');
      expect(input).toHaveClass('flex'); // Base class still applied
    });
  });

  describe('controlled vs uncontrolled', () => {
    it('should work as uncontrolled input', async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="initial" />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveValue('initial');

      await user.clear(input);
      await user.type(input, 'updated');
      expect(input).toHaveValue('updated');
    });

    it('should work as controlled input', async () => {
      const ControlledInput = () => {
        const [value, setValue] = React.useState('');
        return <Input value={value} onChange={(e) => setValue(e.target.value)} />;
      };

      const user = userEvent.setup();
      render(<ControlledInput />);

      const input = screen.getByRole('textbox');
      await user.type(input, 'controlled value');
      expect(input).toHaveValue('controlled value');
    });
  });
});
