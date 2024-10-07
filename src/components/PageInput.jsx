import React from "react";

const PageInput = ({ id }) => {
  const currentPage = Number(id);

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      const newPage = Number(event.target.value);
      // Redirigir a la página 52 si el nuevo número es mayor que 52
      if (!isNaN(newPage) && newPage > 0) {
        const targetPage = newPage > 52 ? 52 : newPage;
        window.location.href = `/page/${targetPage}`; // Redirigir a la nueva página
      }
    }
  };

  return (
    <div className="join items-center flex justify-center mt-20">
      {currentPage === 1 ? (
        <button className="join-item btn" disabled>
          «
        </button>
      ) : (
        <a href={`/page/${currentPage - 1}`}>
          <button className="join-item btn">«</button>
        </a>
      )}
      <input
        type="text"
        className="join-item input input-bordered border-gray-200 w-20 text-center"
        defaultValue={currentPage}
        onKeyDown={handleKeyDown}
        onInput={(e) => {
          // Permitir solo números y limitar a 52
          const newValue = e.target.value.replace(/[^0-9]/g, "");
          if (newValue === "" || Number(newValue) <= 52) {
            e.target.value = newValue; // Actualizar solo si es válido
          }
        }}
      />
      <a href={`/page/${currentPage + 1}`}>
        <button className="join-item btn">»</button>
      </a>
    </div>
  );
};

export default PageInput;
