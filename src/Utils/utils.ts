export const handleOnSetQuantity = (quantity: number): number => {
  if (quantity < 0) return 0;
  else return quantity;
};
