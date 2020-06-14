// @flow strict
import React from 'react';
import { create } from 'react-test-renderer';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Typehead from './Typehead.js';

const TOTAL_OPTIONS = 10;

const FAKE_OPTIONS = Array.from(Array(TOTAL_OPTIONS).keys()).map(item => ({
  value: `value-${item}`,
  label: `label-${item}`,
}));

describe('Typehead', () => {
  const onBlurMock = jest.fn();
  const onFocusMock = jest.fn();
  const onChangeMock = jest.fn();
  const onSelectMock = jest.fn();

  const Component = (
    <Typehead
      id="typehead"
      name="typehead"
      data={FAKE_OPTIONS}
      placeholder="Select a Label"
      onChange={onChangeMock}
      onFocus={onFocusMock}
      onBlur={onBlurMock}
      onSelect={onSelectMock}
      label="Typehead Example"
    />
  );

  it('renders Typehead normal', () => {
    const tree = create(Component).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('shows menu with data on focus', () => {
    render(Component);
    const textField = screen.getByRole('textbox', { id: 'typehead' });
    textField.focus();
    const resultsContainer = screen.getAllByText(/label/i);
    expect(resultsContainer.length).toBe(TOTAL_OPTIONS);
    expect(onFocusMock).toHaveBeenCalled();
    expect(onFocusMock.mock.calls.length).toBe(1);
  });

  it('clears menu on blur', () => {
    render(Component);
    const textField = screen.getByRole('textbox', { id: 'typehead' });
    textField.focus();
    const resultsContainer = screen.getAllByText(/label/i);
    expect(resultsContainer.length).toBe(TOTAL_OPTIONS);

    act(() => {
      textField.blur();
    });
    expect(onBlurMock).toHaveBeenCalled();

    expect(onBlurMock.mock.calls.length).toBe(1);
  });

  it('filters menu on search', () => {
    render(Component);
    const textField = screen.getByRole('textbox', { id: 'typehead' });
    textField.focus();

    fireEvent.change(textField, { target: { value: 'label-3' } });

    const resultsContainer = screen.getAllByText(/label/i);
    expect(resultsContainer.length).toBe(1);
  });

  it('shows no results when no options', () => {
    render(Component);
    const textField = screen.getByRole('textbox', { id: 'typehead' });
    textField.focus();

    fireEvent.change(textField, { target: { value: 'No Result' } });

    const resultsContainer = screen.getByText(/no result/i);
    expect(resultsContainer).toBeInTheDocument();
  });

  it('calls onChange when typing', () => {
    render(Component);
    const textField = screen.getByRole('textbox', { id: 'typehead' });
    textField.focus();

    fireEvent.change(textField, { target: { value: 'label' } });

    expect(onChangeMock).toHaveBeenCalled();
  });

  it('calls onSelect when option is selected', () => {
    render(Component);
    const textField = screen.getByRole('textbox', { id: 'typehead' });
    textField.focus();

    fireEvent.change(textField, { target: { value: 'label-6' } });

    const selectOption = screen.getByText(/label-6/i);

    act(() => {
      selectOption.click();
    });

    const selectedOption = FAKE_OPTIONS.find(option =>
      option.label.includes('6')
    );
    expect(onSelectMock).toHaveBeenCalledWith(selectedOption);
    expect(onSelectMock.mock.calls.length).toBe(1);
  });
});
