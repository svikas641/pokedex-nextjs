export type Pokemon = {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  sprites: { other: { [key: string]: { front_default: string } } };
  location_area_encounters: string;
};
