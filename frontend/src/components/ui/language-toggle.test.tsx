import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LanguageToggle } from './language-toggle';

// Mock lucide-react to check for Check icon
vi.mock('lucide-react', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual as object,
        Check: () => <div data-testid="check-icon" />,
        Languages: () => <div data-testid="languages-icon" />,
    };
});

// Mock useTranslation to control language
const mockChangeLanguage = vi.fn();
const mockUseTranslation = vi.fn(() => ({
    i18n: {
        language: 'en',
        changeLanguage: mockChangeLanguage,
    },
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => mockUseTranslation(),
}));

describe('LanguageToggle', () => {
    it('renders language toggle button', () => {
        render(<LanguageToggle />);
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

// Mock UI components to avoid Radix UI interaction issues
vi.mock('@/components/ui/dropdown-menu', () => ({
    DropdownMenu: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DropdownMenuTrigger: ({ children }: { children: React.ReactNode }) => <div data-testid="trigger">{children}</div>,
    DropdownMenuContent: ({ children }: { children: React.ReactNode }) => <div data-testid="content">{children}</div>,
    DropdownMenuItem: ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
        <button role="menuitem" onClick={onClick}>
            {children}
        </button>
    ),
}));

describe('LanguageToggle', () => {
    it('renders language toggle button', () => {
        render(<LanguageToggle />);
        expect(screen.getByTestId('trigger')).toBeInTheDocument();
    });

    it('shows checkmark for active language (English)', () => {
        mockUseTranslation.mockReturnValue({
            i18n: {
                language: 'en',
                changeLanguage: mockChangeLanguage,
            },
        });

        render(<LanguageToggle />);
        // With mock, content is always rendered
        const englishItem = screen.getByText('English');
        const chineseItem = screen.getByText('繁體中文');
        
        // Check surrounding markup for check icon
        const englishMenuItem = englishItem.closest('[role="menuitem"]');
        const chineseMenuItem = chineseItem.closest('[role="menuitem"]');

        expect(englishMenuItem).toContainHTML('data-testid="check-icon"');
        expect(chineseMenuItem).not.toContainHTML('data-testid="check-icon"');
    });

    it('shows checkmark for active language (Traditional Chinese)', () => {
        mockUseTranslation.mockReturnValue({
            i18n: {
                language: 'zh-TW',
                changeLanguage: mockChangeLanguage,
            },
        });

        render(<LanguageToggle />);
        
        const englishItem = screen.getByText('English');
        const chineseItem = screen.getByText('繁體中文');

        const englishMenuItem = englishItem.closest('[role="menuitem"]');
        const chineseMenuItem = chineseItem.closest('[role="menuitem"]');

        expect(chineseMenuItem).toContainHTML('data-testid="check-icon"');
        expect(englishMenuItem).not.toContainHTML('data-testid="check-icon"');
    });

    it('calls changeLanguage when item is clicked', () => {
        mockUseTranslation.mockReturnValue({
            i18n: {
                language: 'en',
                changeLanguage: mockChangeLanguage,
            },
        });

        render(<LanguageToggle />);
        
        const chineseItem = screen.getByText('繁體中文');
        const button = chineseItem.closest('button');
        fireEvent.click(button!);
        expect(mockChangeLanguage).toHaveBeenCalledWith('zh-TW');
    });
});
});
