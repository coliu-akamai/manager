import Close from '@mui/icons-material/Close';
import { Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { action } from '@storybook/addon-actions';
import { expect, userEvent, within } from '@storybook/test';
import React, { useState } from 'react';

import { IconButton } from 'src/components/IconButton';
import { List } from 'src/components/List';
import { ListItem } from 'src/components/ListItem';
import { linodeFactory } from 'src/factories';

import { Autocomplete } from './Autocomplete';
import { SelectedIcon } from './Autocomplete.styles';

import type { EnhancedAutocompleteProps } from './Autocomplete';
import type { Linode } from '@linode/api-v4';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';

const LABEL = 'Select a Linode';

interface OptionType {
  data?: any;
  label: string;
  value: string;
}

const linodes: OptionType[] = [
  {
    label: 'Linode-001',
    value: 'linode-001',
  },
  {
    label: 'Linode-002',
    value: 'linode-002',
  },
  {
    label: 'Linode-003',
    value: 'linode-003',
  },
  {
    label: 'Linode-004',
    value: 'linode-004',
  },
  {
    label: 'Linode-005',
    value: 'linode-005',
  },
];

const AutocompleteWithSeparateSelectedOptions = (
  props: EnhancedAutocompleteProps<OptionType, true>
) => {
  const [selectedOptions, setSelectedOptions] = React.useState<OptionType[]>(
    []
  );

  const handleSelectedOptions = React.useCallback((selected: OptionType[]) => {
    setSelectedOptions(selected);
  }, []);

  // Function to remove an option from the list of selected options
  const removeOption = (optionToRemove: OptionType) => {
    const updatedSelectedOptions = selectedOptions.filter(
      (option) => option.value !== optionToRemove.value
    );

    // Call onSelectionChange to update the selected options
    handleSelectedOptions(updatedSelectedOptions);
  };

  return (
    <Stack>
      <Autocomplete
        {...props}
        multiple
        onChange={(e, selected) => setSelectedOptions(selected)}
        renderTags={() => null}
        value={selectedOptions}
      />
      {selectedOptions.length > 0 && (
        <>
          <SelectedOptionsHeader>{`Linodes to be Unassigned from Subnet (${selectedOptions.length})`}</SelectedOptionsHeader>

          <SelectedOptionsList>
            {selectedOptions.map((option) => (
              <SelectedOptionsListItem alignItems="center" key={option.value}>
                <StyledLabel>{option.label}</StyledLabel>
                <IconButton
                  aria-label={`remove ${option.value}`}
                  disableRipple
                  onClick={() => removeOption(option)}
                  size="medium"
                >
                  <Close />
                </IconButton>
              </SelectedOptionsListItem>
            ))}
          </SelectedOptionsList>
        </>
      )}
    </Stack>
  );
};

// Story Config ========================================================

const meta: Meta<EnhancedAutocompleteProps<OptionType>> = {
  argTypes: {
    onChange: {
      action: 'onChange',
    },
  },
  args: {
    label: LABEL,
    onChange: action('onChange'),
    options: linodes,
  },
  component: Autocomplete,
  decorators: [
    (Story: StoryFn) => (
      <div style={{ marginLeft: '2em', minHeight: 270 }}>
        <Story />
      </div>
    ),
  ],
  title: 'Components/Selects/Autocomplete',
};

export default meta;

type Story = StoryObj<typeof Autocomplete>;

// Styled Components =================================================

const CustomValue = styled('span')(({ theme }) => ({
  fontFamily: theme.font.bold,
  fontSize: '1rem',
  wordBreak: 'break-word',
}));

const CustomDescription = styled('span')(() => ({
  fontSize: '0.875rem',
}));

const StyledListItem = styled('li')(() => ({
  alignItems: 'center',
  display: 'flex',
  width: '100%',
}));

const StyledLabel = styled('span')(({ theme }) => ({
  color: theme.color.label,
  fontFamily: theme.font.bold,
  fontSize: '14px',
}));

const SelectedOptionsHeader = styled('h4')(({ theme }) => ({
  color: theme.color.headline,
  fontFamily: theme.font.bold,
  fontSize: '14px',
  textTransform: 'initial',
}));

const SelectedOptionsList = styled(List)(({ theme }) => ({
  background: theme.bg.main,
  maxWidth: '416px',
  padding: '5px 0',
  width: '100%',
}));

const SelectedOptionsListItem = styled(ListItem)(() => ({
  justifyContent: 'space-between',
  paddingBottom: 0,
  paddingTop: 0,
}));

// Story Definitions ==========================================================

export const Default: Story = {
  args: {
    defaultValue: linodes[0],
  },
  play: async ({ canvasElement, step }) => {
    /**
     * general thoughts:
     *
     * In terms of writing - either is fine. Storybook component testing
     * feels like vite unit testing (and cypress component tests feel
     * like integration tests) which makes sense haha
     *
     * HOWEVER for a component like autocomplete with many interactions,
     * I prefer cypress component tests:
     * - split up tests by interaction I'm trying to test, rather than by story (?)
     *   - while I'm able to group by the step function, cypress feels like it gives
     *     me a bit more freedom to organize things/group things how I want, and create
     *     isolated tests for specific interactions without having to create new stories
     *
     * Note: I feel like I'm having trouble figuring out multiselect tests for both
     * story and cypress component tests, but that's more of an I need to investigate
     * further problem
     */
    const canvas = within(canvasElement);

    const openMenuButton = canvas.getByLabelText('Open');

    // open menu
    await step('Open menu interaction', async () => {
      await userEvent.click(openMenuButton);
      expect(canvas.getByText('Linode-001')).toBeVisible();
    });

    // clearing selected element
    await step('Clear selected element', async () => {
      expect(canvas.getByRole('combobox')).toHaveValue('Linode-001');
      const clearButton = canvas.getByLabelText('Clear');
      await userEvent.click(clearButton);
      expect(canvas.getByRole('combobox')).toHaveValue('');
    });

    // selecting a new value
    await step('Select a new value', async () => {
      const linode2 = canvas.getByText(/Linode-002/);
      await userEvent.click(linode2);
      expect(canvas.getByRole('combobox')).toHaveValue('Linode-002');
    });
  },
  render: (args) => <Autocomplete {...args} />,
};

export const NoOptionsMessage: Story = {
  args: {
    noOptionsText:
      'This is a custom message when there are no options to display.',
    options: [],
  },
  render: (args) => <Autocomplete {...args} />,
};

type RegionStory = StoryObj<EnhancedAutocompleteProps<OptionType>>;

export const CustomRenderOptions: RegionStory = {
  args: {
    label: 'Select a Linode to Clone',
    options: [
      {
        label: 'Nanode 1 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east',
      },
      {
        label: 'Nanode 2 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east-001',
      },
      {
        label: 'Nanode 3 GB, Debian 11, Newark, NJ',
        value: 'debian-us-east-002',
      },
    ],
    placeholder: 'Select a Linode to Clone',
    renderOption: (props, option, { selected }) => (
      <StyledListItem {...props}>
        <Stack flexGrow={1}>
          <CustomValue>{option.value}</CustomValue>
          <CustomDescription>{option.label}</CustomDescription>
        </Stack>
        <SelectedIcon visible={selected} />
      </StyledListItem>
    ),
  },
  render: (args) => <Autocomplete {...args} />,
};

type MultiSelectStory = StoryObj<EnhancedAutocompleteProps<Linode, true>>;

const linodeList = linodeFactory.buildList(10);

export const MultiSelect: MultiSelectStory = {
  args: {},
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);

    const openMenuButton = canvas.getByLabelText('Open');

    // open menu
    await step('Open menu interaction', async () => {
      await userEvent.click(openMenuButton);
      expect(canvas.getByText('Select All')).toBeVisible();
      expect(canvas.getByText('linode-1')).toBeVisible();
    });

    // Select all elements
    await step('Select all elements', async () => {
      const selectAll = canvas.getByText('Select All');
      await userEvent.click(selectAll);
      expect(canvas.getByText('Deselect All')).toBeVisible();
      expect(canvas.getByLabelText('Clear')).toBeVisible();
    });

    // Deselect all elements
    await step('Deselect all elements', async () => {
      const deselectAll = canvas.getByText('Deselect All');
      await userEvent.click(deselectAll);
      expect(canvas.getByText('Select All')).toBeVisible();
      expect(canvas.queryByLabelText('Clear')).not.toBeInTheDocument();
    });
  },
  render: () => {
    const Example = () => {
      const [selectedLinodes, setSelectedLinodes] = useState<Linode[]>([]);
      return (
        <Autocomplete
          label="Linodes"
          multiple
          onChange={(_, value) => setSelectedLinodes(value)}
          options={linodeList}
          value={selectedLinodes}
        />
      );
    };

    return <Example />;
  },
};

type MultiSelectWithSeparateSelectionOptionsStory = StoryObj<
  EnhancedAutocompleteProps<OptionType, true>
>;

export const MultiSelectWithSeparateSelectionOptions: MultiSelectWithSeparateSelectionOptionsStory = {
  args: {
    multiple: true,
    onChange: (e, selected: OptionType[]) => {
      action('onChange')(selected.map((options) => options.value));
    },
    placeholder: LABEL,
    selectAllLabel: 'Linodes',
  },
  render: (args) => <AutocompleteWithSeparateSelectedOptions {...args} />,
};
