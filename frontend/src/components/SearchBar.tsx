import { useState, type FormEvent } from "react";

interface SearchBarProps {
  onSearch: (termino: string) => void;
  cargando: boolean;
}

function SearchBar({
  onSearch,
  cargando,
}: SearchBarProps) {
  const [termino, setTermino] = useState("");

  function manejarEnvio(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(termino);
  }

  return (
    <form className="search-bar" onSubmit={manejarEnvio}>
      <input
        type="search"
        value={termino}
        onChange={(event) => setTermino(event.target.value)}
        placeholder="Buscar artículos..."
      />

      <button type="submit" disabled={cargando}>
        {cargando ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
}

export default SearchBar;