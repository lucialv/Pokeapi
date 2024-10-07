import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type Pokemon = {
  id: number;
  name: string;
  sprites: {
    front_default: string;
    other: {
      "official-artwork": {
        front_default: string;
      };
    };
  };
  types: Array<{ type: { name: string } }>;
  abilities: Array<{ ability: { name: string }; is_hidden: boolean }>;
  stats: Array<{ base_stat: number; stat: { name: string } }>;
  height: number;
  weight: number;
  base_experience: number;
  species: { url: string };
  moves: Array<{ move: { name: string } }>;
};

type PokemonSpecies = {
  flavor_text_entries: Array<{
    flavor_text: string;
    language: { name: string };
  }>;
  genera: Array<{ genus: string; language: { name: string } }>;
  evolution_chain: { url: string };
};

type EvolutionChain = {
  chain: {
    species: { name: string; url: string };
    evolves_to: Array<{
      species: { name: string; url: string };
      evolves_to: Array<{
        species: { name: string; url: string };
      }>;
    }>;
  };
};

type PokemonType = {
  name: string;
  id: string;
};

const typeMap: Record<string, PokemonType> = {
  normal: { name: "Normal", id: "1" },
  fire: { name: "Fire", id: "10" },
  water: { name: "Water", id: "11" },
  electric: { name: "Electric", id: "13" },
  grass: { name: "Grass", id: "12" },
  ice: { name: "Ice", id: "15" },
  fighting: { name: "Fighting", id: "2" },
  poison: { name: "Poison", id: "4" },
  ground: { name: "Ground", id: "5" },
  flying: { name: "Flying", id: "3" },
  psychic: { name: "Psychic", id: "14" },
  bug: { name: "Bug", id: "7" },
  rock: { name: "Rock", id: "6" },
  ghost: { name: "Ghost", id: "8" },
  dragon: { name: "Dragon", id: "16" },
  dark: { name: "Dark", id: "17" },
  steel: { name: "Steel", id: "9" },
  fairy: { name: "Fairy", id: "18" },
  stellar: { name: "Stellar", id: "19" },
  unknown: { name: "Unknown", id: "10001" },
};

export default function PokemonInfo({ id }: { id: number }) {
  const [pokemon, setPokemon] = useState<Pokemon | null>(null);
  const [species, setSpecies] = useState<PokemonSpecies | null>(null);
  const [evolutionChain, setEvolutionChain] = useState<EvolutionChain | null>(
    null,
  );
  const [evolutionImages, setEvolutionImages] = useState<
    Record<string, string>
  >({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPokemonData = async () => {
      try {
        setIsLoading(true);
        const pokemonResponse = await fetch(
          `https://pokeapi.co/api/v2/pokemon/${id}`,
        );
        if (!pokemonResponse.ok) {
          throw new Error("Failed to fetch Pokémon data");
        }
        const pokemonData: Pokemon = await pokemonResponse.json();
        setPokemon(pokemonData);

        const speciesResponse = await fetch(pokemonData.species.url);
        if (!speciesResponse.ok) {
          throw new Error("Failed to fetch species data");
        }
        const speciesData: PokemonSpecies = await speciesResponse.json();
        setSpecies(speciesData);

        const evolutionResponse = await fetch(speciesData.evolution_chain.url);
        if (!evolutionResponse.ok) {
          throw new Error("Failed to fetch evolution data");
        }
        const evolutionData: EvolutionChain = await evolutionResponse.json();
        setEvolutionChain(evolutionData);

        // Fetch evolution images
        const images: Record<string, string> = {};
        const fetchEvolutionImage = async (url: string) => {
          const speciesId = url.split("/").filter(Boolean).pop(); // Obtener el ID de la especie de la URL
          const pokemonResponse = await fetch(
            `https://pokeapi.co/api/v2/pokemon/${speciesId}`,
          );
          if (!pokemonResponse.ok) {
            throw new Error("Failed to fetch Pokémon evolution data");
          }
          const data = await pokemonResponse.json();
          return data.sprites.other["official-artwork"].front_default; // Usar el artwork oficial
        };

        images[evolutionData.chain.species.name] = await fetchEvolutionImage(
          evolutionData.chain.species.url,
        );
        for (const evo of evolutionData.chain.evolves_to) {
          images[evo.species.name] = await fetchEvolutionImage(evo.species.url);
          for (const finalEvo of evo.evolves_to) {
            images[finalEvo.species.name] = await fetchEvolutionImage(
              finalEvo.species.url,
            );
          }
        }
        setEvolutionImages(images);
      } catch (err) {
        setError("Error fetching Pokémon data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPokemonData();
  }, [id]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-48 w-48 rounded-full mx-auto mb-4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-red-500">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!pokemon || !species || !evolutionChain) return null;

  const englishFlavorText = species.flavor_text_entries
    .find((entry) => entry.language.name === "en")
    ?.flavor_text.replace(/\f/g, " ");

  const englishGenus = species.genera.find(
    (genus) => genus.language.name === "en",
  )?.genus;

  const evolutionNames = [
    evolutionChain.chain.species.name,
    ...evolutionChain.chain.evolves_to.map((evo) => evo.species.name),
    ...evolutionChain.chain.evolves_to.flatMap((evo) =>
      evo.evolves_to.map((finalEvo) => finalEvo.species.name),
    ),
  ];

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center capitalize">
            {pokemon.name} (#{pokemon.id})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <img
              src={pokemon.sprites.other["official-artwork"].front_default}
              alt={pokemon.name}
              className="w-64 h-64 object-contain bg-gray-100/50 rounded-full"
            />
            <div className="flex-1 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-2">Description</h2>
                <p className="text-sm">{englishFlavorText}</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-2">Classification</h2>
                <p className="text-sm">{englishGenus}</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-2">Types</h2>
                <div className="flex flex-wrap gap-2">
                  {pokemon.types.map((type, index) => {
                    const pokemonType = typeMap[type.type.name];
                    return (
                      <span
                        key={index}
                        className="text-xl font-semibold rounded-full px-2 py-1 mt-2 flex items-center gap-2"
                      >
                        <img
                          src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/types/generation-ix/scarlet-violet/${pokemonType.id}.png`}
                          alt={pokemonType.name}
                          className="h-5"
                        />
                      </span>
                    );
                  })}
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-2">Physical Traits</h2>
                <p>Height: {pokemon.height / 10} m</p>
                <p>Weight: {pokemon.weight / 10} kg</p>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-2">Abilities</h2>
                <ul className="list-disc list-inside">
                  {pokemon.abilities.map((ability) => (
                    <li key={ability.ability.name} className="capitalize">
                      {ability.ability.name}
                      {ability.is_hidden && " (Hidden Ability)"}
                    </li>
                  ))}
                </ul>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-2">Evolution Chain</h2>
                <div className="flex flex-wrap items-center gap-4">
                  {evolutionNames.map((name, index) => (
                    <div key={name} className="flex items-center">
                      <div className=" text-center">
                        <img
                          src={evolutionImages[name]}
                          alt={name}
                          className="w-32 h-32 object-contain"
                        />
                        <Badge variant="outline" className="capitalize mt-2">
                          {name}
                        </Badge>
                      </div>
                      {index < evolutionNames.length - 1 && (
                        <span className="text-2xl mx-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke-width="1.5"
                            stroke="currentColor"
                            className="ml-4 h-10 w-10"
                          >
                            <path
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              d="m8.25 4.5 7.5 7.5-7.5 7.5"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-2">Base Stats</h2>
                <div className="space-y-2">
                  {pokemon.stats.map((stat) => (
                    <div
                      key={stat.stat.name}
                      className="flex items-center gap-2"
                    >
                      <span className="w-24 text-sm capitalize">
                        {stat.stat.name}:
                      </span>
                      <Progress
                        value={stat.base_stat}
                        max={255}
                        className="flex-1"
                      />
                      <span className="text-sm font-medium">
                        {stat.base_stat}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <p>Base Experience: {pokemon.base_experience}</p>
                </div>
              </section>

              <Separator />

              <section>
                <h2 className="text-2xl font-semibold mb-2">Moves</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 ">
                  {pokemon.moves.map((move) => (
                    <Badge
                      key={move.move.name}
                      variant="outline"
                      className="capitalize justify-center"
                    >
                      {move.move.name.replace("-", " ")}
                    </Badge>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
