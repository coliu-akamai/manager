import * as React from 'react';
import { checkComponentA11y } from 'support/util/accessibility';
import { componentTests, visualTests } from 'support/util/components';

import { Autocomplete } from 'src/components/Autocomplete/Autocomplete';

componentTests('Autocomplete', () => {
  describe('Autocomplete interactions', () => {
    describe('Open menu', () => {
      /**
       * - Confirms dropbdown can be opened by clicking the arrow button
       */
      it('can open the drop-down menu by clicking the drop-down arrow', () => {

      });

      /**
       * - Confirms dropdown can be opened by typing in the textfield
       */
      it('can open the drop-down menu by typing into the textfield area', () => {
        
      });
    });

    describe('Closing menu', () => {
      // esc, click away, up arrow
    })
  });
});
