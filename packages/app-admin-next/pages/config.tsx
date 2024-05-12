import RequireAuth from '../libs/RequireAuth';
import SwitchButton from '../components/SwitchButton';
import SemcompApi from '../api/semcomp-api';
import { useEffect, useState } from 'react';
import { useAppContext } from '../libs/contextLib';


function Config() {
  const { semcompApi }: { semcompApi: SemcompApi } = useAppContext();
  const [openSingup, setSingup] = useState(false);


  const handleCheckboxChange = (event) => {
    setSingup(event.target.checked);
  };

  useEffect(() => {
    const fetchConfigs = async () => {
      const configs = await semcompApi.getAdminConfig();
      
      setSingup(configs.openSingup);
    }

    fetchConfigs();
  }, []);

  return (<>
    <SwitchButton checked={openSingup}
      onChange={handleCheckboxChange}/>
  </>);
}

export default RequireAuth(Config);