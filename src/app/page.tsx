"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import PokedexGrid from "./components/PokedexGrid";
import PokemonModal from "./components/PokemonModal";
import type { Pokemon } from "./types";

export default function Home() {
  const [selected, setSelected] = useState<Pokemon | null>(null);
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [loading, setLoading] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceIndex, setVoiceIndex] = useState(0);
  const voicesLoaded = useRef(false);
  const [search, setSearch] = useState("");

  // Load voices once
  useEffect(() => {
    if (typeof window === "undefined") return;
    function loadVoices() {
      const allVoices = window.speechSynthesis.getVoices();
      const englishVoices = allVoices.filter(v => v.lang && v.lang.toLowerCase().includes('en'));
      setVoices(englishVoices);
    }
    if (!voicesLoaded.current) {
      if (window.speechSynthesis.getVoices().length > 0) {
        loadVoices();
        voicesLoaded.current = true;
      } else {
        window.speechSynthesis.addEventListener("voiceschanged", () => {
          loadVoices();
          voicesLoaded.current = true;
        }, { once: true });
      }
    }
  }, []);

  // Handler to change voice
  const handleChangeVoice = () => {
    setVoiceIndex((prev) => (voices.length === 0 ? 0 : (prev + 1) % voices.length));
  };

  useEffect(() => {
    async function fetchPokemons() {
      setLoading(true);
      const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=100");
      const data = await res.json();
      const randoms = data.results;
      // Fetch details for each
      const details = await Promise.all(
        randoms.map((p: { url: string }) => fetch(p.url).then((r) => r.json()))
      );
      setPokemons(details);
      setLoading(false);
    }
    fetchPokemons();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-indigo-600 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl p-8 mt-8 mb-8 flex flex-col items-center">
        <header className="mb-8 text-center">
          <h1 className="text-7xl font-bold drop-shadow-lg text-gray-900 mb-6 animate-fade-in" style={{ fontFamily: 'Pacifico, cursive' }}>Pokedex</h1>
          <p className="text-xl text-blue-900/80 animate-fade-in delay-200 mb-4">All the Pokémon data you&apos;ll ever need in one place.</p>
        </header>
        <div className="flex flex-col sm:flex-row items-center gap-2 mb-6">
          <button
            className="text-sm font-semibold bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-1 rounded-full shadow border border-indigo-200 transition"
            onClick={handleChangeVoice}
            disabled={voices.length === 0}
          >
            Change Voice
          </button>
          <span className="text-xs text-gray-700 font-medium">Voice: {voices[voiceIndex]?.name || "Default"}</span>
        </div>
        <div className="w-full mb-6 flex justify-center">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search Pokémon by name..."
            className="w-full sm:w-96 px-4 py-2 rounded-lg border-2 border-indigo-400 bg-white text-gray-900 placeholder-gray-400 shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
            style={{ minHeight: 48 }}
          />
        </div>
        <main className="w-full">
          {loading || voices.length === 0 ? (
            <div className="text-gray-700 text-center animate-pulse">{loading ? "Loading..." : "Loading voices..."}</div>
          ) : (
            <PokedexGrid
              pokemons={search.trim() ? pokemons.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase())) : pokemons}
              onSelect={voices.length > 0 ? (p => setSelected(p)) : () => {}}
            />
          )}
        </main>
        <AnimatePresence>
          {selected && voices.length > 0 && (
            <PokemonModal pokemon={selected} onClose={() => setSelected(null)} voices={voices} voiceIndex={voiceIndex} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
