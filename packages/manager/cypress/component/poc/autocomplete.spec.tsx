import * as React from 'react';
import { ui } from 'support/ui';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';
import { createSpy } from 'support/util/components';

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
        mount(<Autocomplete label="Autocomplete" options={options} />);

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
        mount(<Autocomplete label="Autocomplete" options={options} />);

        // Focus text field by clicking "Autocomplete" label.
        cy.findByText('Autocomplete').should('be.visible').click();

        cy.focused().type(options[0].label);

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');
      });

      /**
       * - Confirms dropdown menu when there are no options
       */
      it('shows the open dropdown menu with no options text', () => {
        mount(<Autocomplete label="Autocomplete" options={[]} />);

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.contains('You have no options to choose from').should('be.visible');
      });
    });

    describe('Closing menu', () => {
      // esc, click away, up arrow
      /**
       * - Confirms autocomplete popper can be closed with the ESC key
       */
      it('can close the autocomplete menu with ESC key', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            onChange={() => {}}
            options={options}
          />
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');

        cy.get('input').type('{esc}');
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      /**
       * Confirms autocomplete can be closed by clicking awway
       */
      it('can close autocomplete popper by clicking away', () => {
        mount(
          <>
            <span id="other-element">Other Element</span>
            <Autocomplete
              label="Autocomplete"
              onChange={() => {}}
              options={options}
            />
          </>
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');

        cy.get('#other-element').click();
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      /**
       * Confirms autocomplete can be closed by clicking the close button
       */
      it('can close autocomplete popper by clicking the close button', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            onChange={() => {}}
            options={options}
          />
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible');

        ui.button
          .findByAttribute('title', 'Close')
          .should('be.visible')
          .should('be.enabled')
          .click();
        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });
    });

    describe('Selection (single)', () => {
      /**
       * - Confirms user can select an initial option
       */
      it('can select an initial option', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            onChange={() => {}}
            options={options}
            placeholder="this is a placeholder"
            value={undefined}
          />
        );

        cy.get('input').should(
          'have.attr',
          'placeholder',
          'this is a placeholder'
        );
        cy.get('input').should('have.attr', 'value', '');
        cy.findByText('Autocomplete').should('be.visible').click();
        cy.focused().type(options[0].label);

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .scrollIntoView()
          .should('be.visible')
          .click();

        // Confirm that selection change is reflected by input field value, and that
        // the autocomplete popper has been dismissed.
        cy.get('input').should('have.attr', 'value', `${options[0].label}`);

        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      /**
       * - Confirms user can change selection after having selected an option
       */
      it('can change the selected option', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            onChange={() => {}}
            options={options}
            placeholder="this is a placeholder"
            value={options[0]}
          />
        );

        cy.get('input').should('have.attr', 'value', `${options[0].label}`);
        cy.findByText('Autocomplete').should('be.visible').click();
        cy.focused().type(options[1].label);

        ui.autocompletePopper
          .findByTitle(`${options[1].label}`)
          .scrollIntoView()
          .should('be.visible')
          .click();

        // Confirm that selection change is reflected by input field value, and that
        // the autocomplete popper has been dismissed.
        cy.get('input').should('have.attr', 'value', `${options[1].label}`);

        cy.get('[data-qa-autocomplete-popper]').should('not.exist');
      });

      /**
       * - Confirms selection option can be cleared
       */
      it('clears the selected option', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            onChange={() => {}}
            options={options}
            placeholder="this is a placeholder"
            value={options[0]}
          />
        );

        cy.get('input').should('have.attr', 'value', `${options[0].label}`);

        cy.findByLabelText('Clear')
          .should('be.visible')
          .should('be.enabled')
          .click();

        cy.get('input').should('have.attr', 'value', '');

        cy.get('input').should(
          'have.attr',
          'placeholder',
          'this is a placeholder'
        );
      });

      /**
       * - Confirms selection cannot be cleared when clearable is disabled
       */
      it('cannot clear the selected option when clearable is disabled', () => {
        mount(
          <Autocomplete
            disableClearable
            label="Autocomplete"
            onChange={() => {}}
            options={options}
            placeholder="this is a placeholder"
            value={options[0]}
          />
        );

        cy.get('input').should('have.attr', 'value', `${options[0].label}`);

        cy.findByLabelText('Clear').should('not.exist');
      });

      /**
       * - Confirms selection cannot be cleared if nothing was chosen
       */
      it('cannot clear selection when nothing is selected', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            onChange={() => {}}
            options={options}
            placeholder="this is a placeholder"
            value={undefined}
          />
        );

        cy.get('input').should('have.attr', 'value', '');
        cy.get('input').should(
          'have.attr',
          'placeholder',
          'this is a placeholder'
        );

        cy.findByLabelText('Clear').should('not.exist');
      });

      describe('onChange', () => {
        /**
         * - Confirms onChange is called when option is selected
         */
        it('calls `onChange` callback when initially selecting option', () => {
          const spyFn = createSpy(() => {}, 'changeSpy');
          mount(
            <Autocomplete
              label="Autocomplete"
              onChange={spyFn}
              options={options}
              placeholder="this is a placeholder"
              value={undefined}
            />
          );

          cy.findByText('Autocomplete').should('be.visible').click();

          cy.focused().type(options[0].label);

          ui.autocompletePopper
            .findByTitle(`${options[0].label}`)
            .scrollIntoView()
            .should('be.visible')
            .click();

          cy.get('@changeSpy').should('have.been.calledOnce');
        });

        /**
         * - Confirms `onChange` callback when option is cleared
         */
        it('calls `onChange` callback when clearing selection', () => {
          const spyFn = createSpy(() => {}, 'changeSpy');
          mount(
            <Autocomplete
              label="Autocomplete"
              onChange={spyFn}
              options={options}
              placeholder="this is a placeholder"
              value={options[0]}
            />
          );

          cy.findByLabelText('Clear')
            .should('be.visible')
            .should('be.enabled')
            .click();

          cy.get('@changeSpy').should('have.been.calledOnce');
        });

        /**
         * - Confirms `onChange` callback when option is changed
         */
        it('calls `onChange` callback changing selection', () => {
          const spyFn = createSpy(() => {}, 'changeSpy');
          mount(
            <Autocomplete
              label="Autocomplete"
              onChange={spyFn}
              options={options}
              placeholder="this is a placeholder"
              value={options[1]}
            />
          );

          cy.findByText('Autocomplete').should('be.visible').click();

          cy.focused().type(options[0].label);

          ui.autocompletePopper
            .findByTitle(`${options[0].label}`)
            .scrollIntoView()
            .should('be.visible')
            .click();

          cy.get('@changeSpy').should('have.been.calledOnce');
        });
      });

      /**
       * - Confirms onBlur is called when focusing away from selection
       */
      it('calls `onBlur` callback when focusing away from selection', () => {
        const spyFn = createSpy(() => {}, 'changeSpy');
        mount(
          <>
            <span id="other-element">Other Element</span>
            <Autocomplete
              label="Autocomplete"
              onBlur={spyFn}
              onChange={() => {}}
              options={options}
              placeholder="this is a placeholder"
              value={undefined}
            />
          </>
        );

        cy.findByText('Autocomplete').should('be.visible').click();

        cy.focused().type(options[0].label);

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .scrollIntoView()
          .should('be.visible')
          .click();
        cy.get('#other-element').click();

        cy.get('@changeSpy').should('have.been.calledOnce');
      });
    });

    describe('Multiselection', () => {
      /**
       * - Confirms multiple selections can be chosen
       */
      it.skip('can select multiple options', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            multiple
            onChange={() => {}}
            options={options}
          />
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();
        ui.autocompletePopper.findByTitle('Select All').should('be.visible');

        ui.autocompletePopper
          .findByTitle(`${options[0].label}`)
          .should('be.visible')
          .click();

        ui.autocompletePopper
          .findByTitle(`${options[1].label}`)
          .should('be.visible')
          .click();

        // figure out how to confirm multi selections
      });

      /**
       * - Confirms multiple options can be cleared
       */
      it.skip('clears all chosen selections', () => {
        // figure out how to confirm clearing
      });

      it('keeps the popper open even after an element is selected', () => {
        mount(
          <Autocomplete
            label="Autocomplete"
            multiple
            onChange={() => {}}
            options={options}
          />
        );

        ui.button
          .findByAttribute('title', 'Open')
          .should('be.visible')
          .should('be.enabled')
          .click();

        ui.autocompletePopper
          .findByTitle(`${options[1].label}`)
          .should('be.visible')
          .click();

        ui.autocompletePopper
          .findByTitle(`${options[1].label}`)
          .should('be.visible');
        cy.get('[data-qa-autocomplete-popper]').should('be.visible');
      });
    });

    visualTests((mount) => {
      describe('Accessibility checks', () => {
        describe('Single select', () => {
          it('passes aXe check when menu is closed without an item selected', () => {
            mount(<Autocomplete label={'Autocomplete'} options={options} />);

            checkComponentA11y();
          });

          it('passes aXe check when menu is closed with an item selected', () => {
            mount(
              <Autocomplete
                label={'Autocomplete'}
                options={options}
                value={options[0]}
              />
            );

            checkComponentA11y();
          });

          it('passes aXe check when menu is open with an item selected', () => {
            mount(
              <Autocomplete
                label={'Autocomplete'}
                options={options}
                value={options[0]}
              />
            );

            ui.button
              .findByAttribute('title', 'Open')
              .should('be.visible')
              .should('be.enabled')
              .click();

            checkComponentA11y();
          });
        });

        describe('MultiSeelct', () => {
          it('passes aXe check when menu is closed without an item selected', () => {
            mount(
              <Autocomplete label={'Autocomplete'} multiple options={options} />
            );

            checkComponentA11y();
          });

          it('passes aXe check when menu is closed with an item selected', () => {
            mount(
              <Autocomplete
                label={'Autocomplete'}
                multiple
                options={options}
                value={[options[0]]}
              />
            );

            checkComponentA11y();
          });

          it('passes aXe check when menu is open with an item selected', () => {
            mount(
              <Autocomplete
                label={'Autocomplete'}
                multiple
                options={options}
                value={[options[0]]}
              />
            );

            ui.button
              .findByAttribute('title', 'Open')
              .should('be.visible')
              .should('be.enabled')
              .click();

            checkComponentA11y();
          });
        });
      });
    });
  });
});
