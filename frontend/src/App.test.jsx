import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';
import { describe, it, expect } from 'vitest';

describe('DevOpsHub App', () => {
    it('renders the main heading', () => {
        render(<App />);
        expect(screen.getByText('DevOpsHub')).toBeInTheDocument();
    });

    it('has a GitHub repository input', () => {
        render(<App />);
        expect(screen.getByPlaceholderText(/https:\/\/github.com\/user\/project/i)).toBeInTheDocument();
    });

    it('has an Analyze button', () => {
        render(<App />);
        expect(screen.getByRole('button', { name: /Analyze Repository/i })).toBeInTheDocument();
    });

    it('allows user to enter a URL', () => {
        render(<App />);
        const input = screen.getByPlaceholderText(/https:\/\/github.com\/user\/project/i);
        fireEvent.change(input, { target: { value: 'https://github.com/user/repo' } });
        expect(input.value).toBe('https://github.com/user/repo');
    });
});
