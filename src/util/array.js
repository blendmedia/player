/**
 * Returns the items added and removed from array `from` to get to `to`
 * @param  {Array} from Starting array
 * @param  {Array} to   Resulting array
 * @return {Object}     changeset
 */
export function changes(from, to) {
  const added = to.filter(el => !from.includes(el));
  const removed = from.filter(el => !to.includes(el));

  return { added, removed };
}
