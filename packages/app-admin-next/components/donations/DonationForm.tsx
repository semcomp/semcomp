import { useState, useEffect } from 'react';
import {SemcompApiItem, SemcompApiDonation, SemcompApiHouse, SemcompApiGetHousesResponse, SemcompApiGetItemsResponse} from "../../models/SemcompApiModels";
import Tier from "../../libs/constants/tier-enum";
import Input, { InputType } from "../Input";
import SemcompApi from '../../api/semcomp-api';
import { useAppContext } from '../../libs/contextLib';
import { PaginationRequest, PaginationResponse } from '../../models/Pagination';
import Item from "../../libs/constants/item-type"

export type DonationFormData = {
  displayHouse: string;
  houseId: string;
  displayItem: string;
  item: SemcompApiItem | null;
  quantity: number;
  points: number;
};

function useDropdownData() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();
  const [houses, setHouses] = useState(null as SemcompApiGetHousesResponse);
  const [items, setItems] = useState(null as SemcompApiGetItemsResponse);
  const [pagination, setPagination] = useState(new PaginationRequest (() => fetchDropdownOptions())); 
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  async function fetchDropdownOptions() {
      setIsLoadingDropdowns(true);
      try {
        const houseList = await semcompApi.getHouses(pagination)
        const itemList = await semcompApi.getItems(pagination)

        console.log(houseList.getEntities());
        console.log(itemList);
        
        setHouses(houseList);
        setItems(itemList);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      } finally {
        setIsLoadingDropdowns(false);
      }
  }

  useEffect(() => {
    fetchDropdownOptions();
  }, [pagination]); // Added pagination to dependency array if you plan to use setPagination later

  return { houses, items, isLoadingDropdowns };
}

function DonationForm({
  onDataChange,
  initialData = {
    displayHouse: "",
    houseId: "",
    displayItem: "",
    item: null,
    quantity: 0,
    points: 0
  },
}: {
  onDataChange: (data: DonationFormData) => void;
  initialData?: DonationFormData;
}) {
  const [data, setData] = useState(initialData);
  const { houses, items, isLoadingDropdowns } = useDropdownData();

  function handleHouseChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const val = event.target.value;

    const selectedHouse = houses == null ? null : houses.getEntities().find(house => house.name == val) || null;

    setData({...data, displayHouse: selectedHouse.name, houseId: selectedHouse.id});
    onDataChange({...data, houseId: selectedHouse.id});
  }

  function handleItemChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const itemName = event.target.value;
    
    // Look up the full item object using the ID
    const selectedItem = items == null? null: items.getEntities().find(item => item.name === itemName) || null;

    // Store the full object in state
    setData({...data, displayItem: selectedItem.name, item: selectedItem});
    onDataChange({...data, item: selectedItem});
  }

  function handleQtdChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target;
    const updatedValue = parseFloat(val.value) || 0;
    
    setData({...data, quantity: updatedValue});
    onDataChange({...data, quantity: updatedValue});
  }


  // Optional: Render loading state if data is still fetching
  if (isLoadingDropdowns) {
      return <div>Carregando opções...</div>
  }

  return (
    <>
      <Input
        className="my-3"
        label="Casa do Doador"
        value={data.displayHouse} 
        onChange={handleHouseChange}
        type={InputType.Select}
        choices={houses.getEntities().map(x => x.name)}
      />

      <Input
        className="my-3"
        label="Item a Ser Doado"
        value={data.displayItem || ""} 
        onChange={handleItemChange}
        type={InputType.Select}
        choices={items.getEntities().map(x => x.name)}
      />
      
      <Input
        className="my-3"
        label="Quantidade"
        value={data.quantity}
        onChange={handleQtdChange}
        type={InputType.Number}
      />
      
    </>
  );
}

export default DonationForm
