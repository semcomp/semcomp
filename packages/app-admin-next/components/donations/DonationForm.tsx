import { useState, useEffect } from 'react';
import {SemcompApiItem, SemcompApiDonation, SemcompApiHouse, SemcompApiGetHousesResponse, SemcompApiGetItemsResponse} from "../../models/SemcompApiModels";
import Tier from "../../libs/constants/tier-enum";
import Input, { InputType } from "../Input";
import SemcompApi from '../../api/semcomp-api';
import { useAppContext } from '../../libs/contextLib';
import { PaginationRequest, PaginationResponse } from '../../models/Pagination';
import Item from "../../libs/constants/item-type"

export type DonationFormData = {
  houseId: string;
  item: Item | null;
  quantity: number;
  points: number;
};

function useDropdownData() {
  const {semcompApi}: {semcompApi: SemcompApi} = useAppContext();
  const [houses, setHouses] = useState(null as SemcompApiGetHousesResponse);
  const [items, setItems] = useState(null as SemcompApiGetItemsResponse);
  const [pagination, setPagination] = useState<PaginationRequest>();
  const [isLoadingDropdowns, setIsLoadingDropdowns] = useState(true);

  useEffect(() => {
    async function fetchDropdownOptions() {
      setIsLoadingDropdowns(true);
      try {
        const houseList = await semcompApi.getHouses(pagination)
        const itemList = await semcompApi.getItems(pagination)
        
        setHouses(houseList);
        setItems(itemList);
      } catch (error) {
        console.error("Failed to fetch dropdown data:", error);
      } finally {
        setIsLoadingDropdowns(false);
      }
    }
    fetchDropdownOptions();
  }, []);

  return { houses, items, isLoadingDropdowns };
}

function DonationForm({
  onDataChange,
  initialData = {
    houseId: "",
    item: null,
    quantity: 0,
    points: 0,
  },
}: {
  onDataChange: (data: DonationFormData) => void;
  initialData?: DonationFormData;
}) {
  const [data, setData] = useState(initialData);
  const { houses, items, isLoadingDropdowns } = useDropdownData();

  function handleHouseChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const val = event.target.value;
    setData({...data, houseId: val});
    onDataChange({...data, houseId: val});
  }

  function handleItemChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const itemId = event.target.value;
    
    const selectedItem = items == null? null: items.getEntities().find(item => item.id === itemId) || null;

    setData({...data, item: selectedItem});
    onDataChange({...data, item: selectedItem});
  }

  function handleQtdChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target;
    const updatedValue = parseFloat(val.value) || 0;
    
    setData({...data, quantity: updatedValue});
    onDataChange({...data, quantity: updatedValue});
  }

  function handlePointsChange(event: React.ChangeEvent<HTMLInputElement>) {
    const val = event.target;
    const updatedValue = parseFloat(val.value) || 0;
    
    setData({...data, points: updatedValue});
    onDataChange({...data, points: updatedValue});
  }

  return (
    <>
      <Input
        className="my-3"
        label="Casa do Doador"
        value={data.houseId} 
        onChange={handleHouseChange}
        type={InputType.Select}
        choices={houses == null? []: houses.getEntities().map(h => ({ label: h.name, value: h.id }))}
      />

      <Input
        className="my-3"
        label="Item a Ser Doado"
        value={data.item?.name || ""} 
        onChange={handleItemChange}
        type={InputType.Select}
        choices={items == null? []: items.getEntities().map(i => ({ label: i.name, value: i }))}
      />
      
      <Input
        className="my-3"
        label="Quantidade"
        value={data.quantity}
        onChange={handleQtdChange}
        type={InputType.Number}
      />
      
      <Input
        className="my-3"
        label="Pontos"
        value={data.points}
        onChange={handlePointsChange}
        type={InputType.Number}
      />
    </>
  );
}

export default DonationForm