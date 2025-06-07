"use client";
import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type Pokemon = {
  id: number;
  name: string;
  types: { type: { name: string } }[];
  stats: { base_stat: number; stat: { name: string } }[];
  moves: { move: { name: string } }[];
  sprites: { other: { [key: string]: { front_default: string } } };
  location_area_encounters: string;
};

type Props = {
  pokemon: Pokemon;
  onClose: () => void;
  voices: SpeechSynthesisVoice[];
  voiceIndex: number;
};

export default function PokemonModal({ pokemon, onClose, voices, voiceIndex }: Props) {
  const [locations, setLocations] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      setLoading(true);
      const res = await fetch(pokemon.location_area_encounters);
      const data = await res.json();
      setLocations(
        Array.isArray(data) && data.length > 0
          ? data.map((l: { location_area: { name: string } }) => l.location_area.name)
          : ["Not found"]
      );
      setLoading(false);
    }
    fetchLocations();
  }, [pokemon]);

  // Get two random moves (no duplicates)
  const randomMoves = useMemo(() => {
    if (pokemon.moves.length > 1) {
      const first = pokemon.moves[Math.floor(Math.random() * pokemon.moves.length)].move.name;
      let second = first;
      while (second === first && pokemon.moves.length > 1) {
        second = pokemon.moves[Math.floor(Math.random() * pokemon.moves.length)].move.name;
      }
      return [first, second];
    } else {
      return pokemon.moves.map((m) => m.move.name);
    }
  }, [pokemon.moves]);

  // Get stats
  const getStat = (name: string) => pokemon.stats.find((s) => s.stat.name === name)?.base_stat || 0;

  // Only show up to two unique locations
  const shownLocations = Array.from(new Set(locations)).slice(0, 2);

  // Speech synthesis effect
  useEffect(() => {
    if (typeof window === "undefined" || voices.length === 0) {
      return;
    }
    const synth = window.speechSynthesis;
    const type = pokemon.types[0]?.type.name || "unknown";
    const locs = shownLocations.length > 0 ? shownLocations.join(", ") : "unknown";
    const movesText = randomMoves.length > 0 ? randomMoves.join(", ") : "none";
    const text = `${pokemon.name} is a ${type} type Pokémon. Its regions are ${locs}. Its special moves are ${movesText}.`;
    let utter: SpeechSynthesisUtterance | null = null;
    function speakWithVoice() {
      utter = new window.SpeechSynthesisUtterance(text);
      utter.voice = voices[voiceIndex] || voices[0];
      utter.rate = 1;
      utter.pitch = 1;
      utter.volume = 1;
      synth.speak(utter!);
    }
    speakWithVoice();
    return () => {
      synth.cancel();
      if (utter) synth.cancel();
    };
  }, [pokemon.name, pokemon.types, shownLocations, randomMoves, voices, voiceIndex]);

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-gradient-to-br from-black/80 via-indigo-900/80 to-blue-900/80 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="bg-white/95 rounded-2xl shadow-2xl p-8 w-[350px] relative flex flex-col items-center border border-gray-200"
        initial={{ scale: 0.7, y: 80 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.7, y: 80 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500 text-3xl font-bold bg-white/80 rounded-full w-10 h-10 flex items-center justify-center shadow-md border border-gray-200"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <Image
          src={pokemon.sprites.other["official-artwork"].front_default}
          alt={pokemon.name}
          width={144}
          height={144}
          className="w-36 h-36 mb-3 rounded-full border-4 border-indigo-200 shadow-xl bg-white object-contain"
          unoptimized
        />
        <div className="capitalize text-3xl font-extrabold mb-2 text-gray-800 tracking-wide text-center drop-shadow">{pokemon.name}</div>
        <div className="mb-2 text-xs text-gray-500 font-medium">Voice: {voices[voiceIndex]?.name || "Default"}</div>
        <div className="flex gap-2 mb-4">
          {pokemon.types.map((t) => (
            <span key={t.type.name} className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 text-white text-sm font-semibold shadow capitalize border border-blue-200">
              {t.type.name}
            </span>
          ))}
        </div>
        <div className="w-full mb-4">
          <div className="font-bold text-base mb-2 text-gray-700">Base Stats</div>
          <div className="space-y-2">
            <StatBar label="HP" value={getStat("hp")}/>
            <StatBar label="ATK" value={getStat("attack")}/>
            <StatBar label="DEF" value={getStat("defense")}/>
            <StatBar label="SPD" value={getStat("speed")}/>
          </div>
        </div>
        <div className="w-full mb-4">
          <div className="font-bold text-base mb-2 text-gray-700">Special Moves</div>
          <div className="flex gap-2 flex-wrap">
            {randomMoves.map((move, idx) => (
              <span key={move + idx} className="bg-gradient-to-r from-indigo-100 to-blue-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium capitalize border border-indigo-200 shadow">
                {move}
              </span>
            ))}
          </div>
        </div>
        <div className="w-full">
          <div className="font-bold text-base mb-2 text-gray-700">Locations</div>
          <div className="text-sm text-gray-700 font-medium">
            {loading ? "Loading..." : shownLocations.join(", ")}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-10 text-xs text-gray-700">{label}:</div>
      <div className="flex-1 bg-gray-200 rounded h-3 overflow-hidden">
        <motion.div
          className="h-3 rounded bg-gradient-to-r from-blue-400 to-indigo-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value, 100)}%` }}
          transition={{ duration: 0.7 }}
        />
      </div>
      <div className="w-8 text-xs text-gray-700 text-right">{value}</div>
    </div>
  );
}
