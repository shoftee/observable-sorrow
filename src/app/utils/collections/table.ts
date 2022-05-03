import { getOrAdd } from ".";

export class Table<Row, Column, Cell> {
  static readonly EMPTY_ROW = new Map();

  private readonly table = new Map<Row, Map<Column, Cell>>();

  cell(row: Row, column: Column): Cell | undefined {
    const cellColumns = this.table.get(row);
    return cellColumns?.get(column);
  }

  row(row: Row): ReadonlyMap<Column, Cell> {
    const cellColumns = this.table.get(row);
    return cellColumns || Table.EMPTY_ROW;
  }

  add(row: Row, column: Column, setter: (exists: boolean) => Cell | undefined) {
    const cellColumns = getOrAdd(this.table, row, () => new Map());
    const newValue = setter(cellColumns.has(column));
    cellColumns.set(column, newValue);
  }

  removeCell(row: Row, column: Column): boolean {
    const cellColumns = this.table.get(row);
    if (cellColumns && cellColumns.delete(column) && cellColumns.size === 0) {
      this.table.delete(row);
      return true;
    }
    return false;
  }

  removeRow(row: Row): boolean {
    return this.table.delete(row);
  }

  *rows(): Iterable<[Row, ReadonlyMap<Column, Cell>]> {
    yield* this.table;
  }
}
