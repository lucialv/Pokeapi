import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Pokemon {
  id: number;
  name: string;
  sprite: string;
  types: string[];
}

interface PokemonPaginationProps {
  initialLimit?: number;
}

function PokemonPagination({ initialLimit = 1 }: PokemonPaginationProps) {
  const [pokemons, setPokemons] = useState<Pokemon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(initialLimit);
  const [totalPages, setTotalPages] = useState(0);
  const [goToPage, setGoToPage] = useState("");

  useEffect(() => {
    const fetchPokemons = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokedex/1/`);
        const data = await response.json();

        const totalPokemons = data.pokemon_entries.length;
        const calculatedTotalPages = Math.ceil(totalPokemons / 20);
        setTotalPages(calculatedTotalPages);

        const startIndex = (currentPage - 1) * 20;
        const selectedPokemons = data.pokemon_entries.slice(
          startIndex,
          startIndex + 20,
        );

        const pokemonDetails = await Promise.all(
          selectedPokemons.map(async (entry: any) => {
            const pokemonResponse = await fetch(entry.pokemon_species.url);
            const pokemonData = await pokemonResponse.json();
            const spriteUrl = pokemonData.varieties[0].pokemon.url;
            const spriteResponse = await fetch(spriteUrl);
            const spriteData = await spriteResponse.json();

            return {
              id: spriteData.id,
              name: spriteData.name,
              sprite:
                spriteData.sprites.other["official-artwork"].front_default,
              types: spriteData.types.map((type: any) => type.type.name),
            };
          }),
        );

        setPokemons(pokemonDetails);
      } catch (error) {
        console.error("Error fetching Pokemon data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemons();
  }, [currentPage]);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));

  const handleGoToPage = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const pageNumber = parseInt(goToPage);
      if (!isNaN(pageNumber) && pageNumber >= 1 && pageNumber <= totalPages) {
        setCurrentPage(pageNumber);
        setGoToPage("");
      } else {
        alert(`Please enter a valid page number between 1 and ${totalPages}`);
      }
    }
  };

  const getTypeColor = (type: string) => {
    const typeColors: { [key: string]: string } = {
      normal: "bg-gray-400",
      fire: "bg-red-500",
      water: "bg-blue-500",
      electric: "bg-yellow-400",
      grass: "bg-green-500",
      ice: "bg-blue-300",
      fighting: "bg-red-600",
      poison: "bg-purple-500",
      ground: "bg-yellow-600",
      flying: "bg-indigo-400",
      psychic: "bg-pink-500",
      bug: "bg-green-400",
      rock: "bg-yellow-700",
      ghost: "bg-purple-600",
      dragon: "bg-indigo-600",
      dark: "bg-gray-700",
      steel: "bg-gray-400",
      fairy: "bg-pink-300",
    };
    return typeColors[type] || "bg-gray-500";
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-4xl font-bold text-center mb-8 text-primary">
        Pokédex
      </h2>
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {pokemons.map((pokemon) => (
              <a href={`/pokemon/${pokemon.id}`}>
                <Card
                  key={pokemon.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow duration-300"
                >
                  <CardContent className="p-4">
                    <div className="relative">
                      <img
                        className="w-full h-48 object-contain"
                        src={pokemon.sprite}
                        alt={pokemon.name}
                      />
                      <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold rounded-bl-lg px-2 py-1">
                        #{pokemon.id.toString().padStart(3, "0")}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold mt-2 text-center capitalize">
                      {pokemon.name}
                    </h3>
                    <div className="flex justify-center mt-2 gap-2">
                      {pokemon.types.map((type) => (
                        <span
                          key={type}
                          className={`${getTypeColor(type)} text-white text-xs font-bold px-2 py-1 rounded`}
                        >
                          {type}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
          <div className="flex justify-center items-center mt-8 gap-4">
            <Button onClick={handlePrevPage} disabled={currentPage === 1}>
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span className="text-lg font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <Input
              type="number"
              placeholder="Go to page"
              value={goToPage}
              onChange={(e) => setGoToPage(e.target.value)}
              onKeyPress={handleGoToPage}
              className="w-24 text-center"
            />
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default PokemonPagination;
