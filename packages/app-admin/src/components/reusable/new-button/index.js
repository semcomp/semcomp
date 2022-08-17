import React from 'react';

import PlusIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/Button';

/**
 * @param {object} param
 *
 * @return {object}
 */
function NewButton({onClick}) {
  return (
    <IconButton onClick={onClick}>
      Criar <PlusIcon />
    </IconButton>
  );
}

export default NewButton;
