'use client';

import React, { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: (SelectOption<T> | string)[];
  placeholder?: string;
  label?: string;
  required?: boolean;
  error?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  triggerClassName?: string;
  menuClassName?: string;
  searchable?: boolean;
  clearable?: boolean;
  leftIcon?: React.ReactNode;
  id?: string;
  name?: string;
  renderOption?: (option: SelectOption<T>, isSelected: boolean) => React.ReactNode;
}

export function Select<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = 'Select an option...',
  label,
  required = false,
  error,
  disabled = false,
  size = 'md',
  className = '',
  triggerClassName = '',
  menuClassName = '',
  searchable = false,
  clearable = false,
  leftIcon,
  id,
  name,
  renderOption,
}: SelectProps<T>) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);

  // Normalize options into SelectOption objects
  const normalizedOptions: SelectOption<T>[] = React.useMemo(() => {
    return options.map((opt) => {
      if (typeof opt === 'string') {
        return { value: opt as T, label: opt };
      }
      return opt;
    });
  }, [options]);

  // Find currently selected option
  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) return normalizedOptions;
    const q = searchQuery.toLowerCase();
    return normalizedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q)) ||
        opt.value.toLowerCase().includes(q)
    );
  }, [normalizedOptions, searchQuery]);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Focus search input on open if searchable
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
    if (!isOpen) {
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  }, [isOpen, searchable]);

  // Scroll highlighted item into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const items = listboxRef.current.querySelectorAll('[role="option"]');
      const item = items[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [highlightedIndex, isOpen]);

  const handleSelect = (option: SelectOption<T>) => {
    if (option.disabled) return;
    onChange(option.value);
    setIsOpen(false);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('' as T);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev < filteredOptions.length - 1 ? prev + 1 : 0;
          return filteredOptions[next]?.disabled ? (next + 1) % filteredOptions.length : next;
        });
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex((prev) => {
          const next = prev > 0 ? prev - 1 : filteredOptions.length - 1;
          return filteredOptions[next]?.disabled ? Math.max(0, next - 1) : next;
        });
        break;
      case 'Enter':
      case ' ':
        if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
          e.preventDefault();
          const option = filteredOptions[highlightedIndex];
          if (option && !option.disabled) {
            handleSelect(option);
          }
        }
        break;
      case 'Tab':
        setIsOpen(false);
        break;
    }
  };

  // Size styling variants
  const sizeStyles = {
    sm: {
      trigger: 'px-2.5 py-1.5 text-xs rounded-lg min-h-[32px]',
      icon: 'w-3 h-3',
      text: 'text-xs',
      menuItem: 'px-2.5 py-1.5 text-xs',
    },
    md: {
      trigger: 'px-3 py-2 text-sm rounded-xl min-h-[40px]',
      icon: 'w-3.5 h-3.5',
      text: 'text-sm',
      menuItem: 'px-3 py-2 text-sm',
    },
    lg: {
      trigger: 'px-4 py-2.5 text-base rounded-xl min-h-[46px]',
      icon: 'w-4 h-4',
      text: 'text-base',
      menuItem: 'px-3.5 py-2.5 text-base',
    },
  }[size];

  return (
    <div className={`relative w-full text-left ${className}`} ref={containerRef}>
      {/* Optional Top Label */}
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-zinc-400 mb-1 flex items-center justify-between"
        >
          <span className="truncate">{label}</span>
          {required && <span className="text-rose-400 font-bold ml-1">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        id={selectId}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-labelledby={label ? selectId : undefined}
        className={`w-full flex items-center justify-between gap-2 border bg-zinc-950 font-medium transition-all duration-150 select-none cursor-pointer focus:outline-none ${
          sizeStyles.trigger
        } ${
          disabled
            ? 'opacity-50 cursor-not-allowed border-zinc-800 text-zinc-500'
            : isOpen
            ? 'border-brand-500 ring-1 ring-brand-500/50 shadow-sm shadow-brand-500/10 text-white'
            : error
            ? 'border-rose-500/80 hover:border-rose-400 text-zinc-100'
            : 'border-zinc-800 hover:border-zinc-700 text-zinc-100 hover:bg-zinc-900/60'
        } ${triggerClassName}`}
      >
        {/* Left Side: Optional Icon & Selected Value / Placeholder */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {leftIcon && <span className="flex-shrink-0 text-zinc-400">{leftIcon}</span>}
          {selectedOption?.icon && (
            <span className="flex-shrink-0 text-zinc-400">{selectedOption.icon}</span>
          )}
          <span
            className={`truncate ${
              selectedOption ? 'text-zinc-100 font-medium' : 'text-zinc-500 font-normal'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        {/* Right Side: Clear Button & Chevron */}
        <div className="flex items-center gap-1.5 flex-shrink-0 ml-1">
          {clearable && selectedOption && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              onKeyDown={(e) => e.key === 'Enter' && handleClear(e as unknown as React.MouseEvent)}
              className="p-0.5 rounded hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              title="Clear selection"
            >
              <X className={sizeStyles.icon} />
            </span>
          )}
          <ChevronDown
            className={`${sizeStyles.icon} text-zinc-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-brand-400' : ''
            }`}
          />
        </div>
      </button>

      {/* Hidden input for form submission if name is provided */}
      {name && <input type="hidden" name={name} value={value} />}

      {/* Dropdown Menu Flyout */}
      {isOpen && (
        <div
          className={`absolute z-50 left-0 right-0 mt-1.5 rounded-xl border border-zinc-800 bg-zinc-900/98 shadow-2xl backdrop-blur-xl animate-in fade-in-50 zoom-in-95 duration-150 overflow-hidden ${menuClassName}`}
        >
          {/* Search bar inside dropdown if searchable */}
          {searchable && (
            <div className="p-2 border-b border-zinc-800/80 bg-zinc-950/60">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setHighlightedIndex(0);
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="Search options..."
                  className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>
          )}

          {/* Options List */}
          <ul
            ref={listboxRef}
            role="listbox"
            tabIndex={-1}
            className="max-h-56 overflow-y-auto py-1 scrollbar-thin divide-y divide-zinc-800/30"
          >
            {filteredOptions.length === 0 ? (
              <li className="px-3 py-3 text-center text-xs text-zinc-500">
                {searchQuery ? `No matches for "${searchQuery}"` : 'No options available'}
              </li>
            ) : (
              filteredOptions.map((opt, index) => {
                const isSelected = opt.value === value;
                const isHighlighted = highlightedIndex === index;

                return (
                  <li
                    key={`${opt.value}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                      sizeStyles.menuItem
                    } ${
                      opt.disabled
                        ? 'opacity-40 cursor-not-allowed bg-transparent text-zinc-600'
                        : isSelected
                        ? 'bg-brand-500/15 text-white font-medium border-l-2 border-brand-500'
                        : isHighlighted
                        ? 'bg-zinc-800/80 text-zinc-100'
                        : 'text-zinc-300 hover:bg-zinc-800/50 hover:text-white'
                    }`}
                  >
                    {renderOption ? (
                      renderOption(opt, isSelected)
                    ) : (
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {opt.icon && (
                          <span
                            className={`flex-shrink-0 ${
                              isSelected ? 'text-brand-400' : 'text-zinc-400'
                            }`}
                          >
                            {opt.icon}
                          </span>
                        )}
                        <div className="min-w-0 flex-1">
                          <p
                            className={`truncate ${
                              isSelected ? 'font-semibold text-white' : 'font-medium'
                            }`}
                          >
                            {opt.label}
                          </p>
                          {opt.description && (
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Selected checkmark indicator */}
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-brand-400 flex-shrink-0 ml-1.5" />
                    )}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}

      {/* Optional Error Message */}
      {error && <p className="text-[11px] text-rose-400 mt-1 font-medium">{error}</p>}
    </div>
  );
}

export default Select;

