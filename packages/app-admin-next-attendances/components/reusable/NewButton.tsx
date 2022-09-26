import PlusIcon from '@mui/icons-material/Add';
import IconButton from '@mui/material/Button';

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
