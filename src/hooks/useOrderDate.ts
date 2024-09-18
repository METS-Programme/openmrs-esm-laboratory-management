import { useState, useEffect } from "react";
import { initialState, getLaboratoryStore } from "../store";

export const useOrderDate = () => {
  const [currentOrdersDate, setCurrentOrdersDate] = useState(
    () =>
      getLaboratoryStore().getState()?.ordersDate?.toString() ??
      initialState?.ordersDate
  );

  useEffect(() => {
    const unsubscribe = getLaboratoryStore().subscribe(({ ordersDate }) =>
      setCurrentOrdersDate(ordersDate.toString())
    );
    return unsubscribe;
  }, []);

  return { currentOrdersDate, setCurrentOrdersDate };
};
