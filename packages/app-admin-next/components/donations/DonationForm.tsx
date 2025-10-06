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

  const updateData = (updatedFields: Partial<DonationFormData>) => {
    const updatedData = { ...data, ...updatedFields };
    setData(updatedData);
    onDataChange(updatedData);
  };

  function handleHouseChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const houseId = event.target.value;
    updateData({ houseId });
  }

  function handleItemChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const itemId = event.target.value;
    
    const selectedItem = items.getEntities().find(item => item.id === itemId) || null;

    updateData({ item: selectedItem });
  }

  function handleNumberChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;
    const updatedValue = parseFloat(value) || 0;
    
    updateData({ [name]: updatedValue } as Partial<DonationFormData>);
  }

  return (
    <>
      <Input
        className="my-3"
        label="Casa do Doador"
        value={data.houseId} 
        onChange={handleHouseChange}
        type={InputType.Select}
        choices={houses.getEntities().map(h => ({ label: h.name, value: h.id }))}
      />

      <Input
        className="my-3"
        label="Item a Ser Doado"
        value={data.item?.name || ""} 
        onChange={handleItemChange}
        type={InputType.Select}
        choices={items.getEntities().map(i => ({ label: i.name, value: i }))}
      />
      
      <Input
        className="my-3"
        label="Quantidade"
        value={data.quantity}
        onChange={handleNumberChange}
        type={InputType.Number}
      />
      
      <Input
        className="my-3"
        label="Pontos"
        value={data.points}
        onChange={handleNumberChange}
        type={InputType.Number}
      />
    </>
  );
}

export default DonationForm