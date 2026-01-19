const shelfRows = ['5', '4', '3', '2'];
const shelfColumns = ['A', 'B', 'C', 'D', 'E'];

const buildShelfItems = (isFocus) => {
  if (!isFocus) {
    return [
      { id: 'item-conduit', name: 'Conduit kit', qty: 2 },
      { id: 'item-multimeter', name: 'Multimeter', qty: 1 }
    ];
  }

  return [
    { id: 'item-thermostat-honeywell', name: 'Thermostat · Honeywell T6', qty: 3 },
    { id: 'item-thermostat-nest', name: 'Thermostat · Nest 4th Gen', qty: 1 }
  ];
};

export const shelves = shelfRows.flatMap((row, rowIndex) =>
  shelfColumns.map((column, columnIndex) => {
    const id = `${row}${column}`;
    const isFocus = rowIndex === 0 && columnIndex === 4;

    return {
      id,
      displayName: id,
      items: buildShelfItems(isFocus)
    };
  })
);

export const warnings = [
  {
    id: 'calibration',
    title: 'Calibration due',
    detail: '8 multimeters require calibration before dispatch.',
    severity: 'medium'
  },
  {
    id: 'consumables',
    title: 'Missing consumables',
    detail: 'Drywall screws are below minimum threshold.',
    severity: 'high'
  },
  {
    id: 'fuel',
    title: 'Fuel check',
    detail: 'Generator fuel at 64% — confirm before release.',
    severity: 'low'
  }
];

export const dashboardMeta = {
  hub: 'Warehouse 03 · West Hub',
  route: 'Route 7A · Morning trades',
  status: 'Load locked pending checks'
};