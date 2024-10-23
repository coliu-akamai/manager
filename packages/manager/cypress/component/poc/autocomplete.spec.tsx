import * as React from 'react';
import { ui } from 'support/ui';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

componentTests('Autocomplete', (mount) => {
  const options = Array.from({ length: 3 }, (_, index) => {
    const num = index + 1;
    return {
      label: `my-option-${num}`,
      value: `my-option-${num}`,
    };
  });

  describe('Autocomplete interactions', () => {
    describe('Open menu', () => {
      /**
       * - Confirms dropbdown can be opened by clicking the arrow button
       */
      it('can open the drop-down menu by clicking the drop-down arrow', () => {
        mount(<Autocomplete label={'Autocomplete'} options={options} />);

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');
        ui.autocompletePopper
          .findByTitle(`${options[1].label}`)
          .should('be.visible');
        ui.autocompletePopper
          .findByTitle(`${options[2].label}`)
          .should('be.visible');
      });

      /**
       * - Confirms dropdown can be opened by typing in the textfield
       */
      it('can open the drop-down menu by typing into the textfield area', () => {
        mount(<Autocomplete label={'Autocomplete'} options={options} />);

        // Focus text field by clicking "Region" label.
        cy.findByText('Autocomplete').should('be.visible').click();

        cy.focused().type(options[0].label);

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');
      });
    });

    describe('Closing menu', () => {
      // esc, click away, up arrow
    });
  });
});
