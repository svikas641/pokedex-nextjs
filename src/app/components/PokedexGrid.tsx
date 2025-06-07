import { motion } from "framer-motion";

const typeColors: Record<string, string> = {
  bug: "bg-lime-500",
  fire: "bg-red-500",
  water: "bg-blue-500",
  electric: "bg-yellow-400",
  poison: "bg-purple-500",
  psychic: "bg-pink-500",
  fighting: "bg-orange-800",
  ground: "bg-yellow-700",
  flying: "bg-indigo-300",
  fairy: "bg-pink-300",
  ice: "bg-cyan-300",
  dragon: "bg-indigo-700",
  grass: "bg-green-500",
  normal: "bg-gray-400",
};

type Pokemon = {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  sprites: { other: { [key: string]: { front_default: string } } };
};

export default function PokedexGrid({ pokemons, onSelect }: { pokemons: Pokemon[]; onSelect: (p: Pokemon) => void }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
      {pokemons.map((pokemon, i) => {
        const types = pokemon.types.map((t) => t.type.name);
        const color = typeColors[types[0]] || "bg-gray-300";
        return (
          <motion.div
            key={pokemon.id}
            layout
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            whileHover={{ scale: 1.05 }}
            className={`rounded-xl shadow-lg cursor-pointer p-4 flex flex-col items-center ${color} text-white font-semibold transition-colors`}
            onClick={() => onSelect(pokemon)}
          >
            <img
              src={pokemon.sprites.other["official-artwork"].front_default}
              alt={pokemon.name}
              className="w-24 h-24 mb-2 drop-shadow-lg"
              loading="lazy"
            />
            <div className="capitalize text-lg mb-1">{pokemon.name}</div>
            <div className="flex gap-2">
              {types.map((type) => (
                <span
                  key={type}
                  className="px-2 py-0.5 rounded bg-white/20 text-xs capitalize"
                >
                  {type}
                </span>
              ))}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
