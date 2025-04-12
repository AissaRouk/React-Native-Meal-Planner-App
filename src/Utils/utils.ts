export const handleOnSetQuantity = (
  quantity: number,
  setQuantity: (quantity: number) => void,
) => {
  if (quantity < 0) setQuantity(0);
  else setQuantity(quantity);
};
