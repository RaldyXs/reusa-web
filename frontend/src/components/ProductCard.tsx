import {
  Heart,
  MapPin,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import type {
  Articulo,
} from "../interfaces/articulo";

import {
  guardarFavorito,
  quitarFavorito,
} from "../services/favoritoService";

interface ProductCardProps {
  articulo: Articulo;
  inicialmenteGuardado?: boolean;
  onSavedChange?: (
    articuloId: number,
    guardado: boolean,
  ) => void;
}

function ProductCard({
  articulo,
  inicialmenteGuardado = false,
  onSavedChange,
}: ProductCardProps) {
  const navigate = useNavigate();

  const [guardado, setGuardado] =
    useState(inicialmenteGuardado);

  const [procesandoGuardado, setProcesandoGuardado] =
    useState(false);

  const [errorGuardado, setErrorGuardado] =
    useState("");

  const precioFormateado = Number(
    articulo.precio,
  ).toLocaleString("es-DO", {
    style: "currency",
    currency: "DOP",
    maximumFractionDigits: 0,
  });

  function abrirDetalle(): void {
    navigate(
      `/producto/${articulo.articulo_id}`,
    );
  }

  async function alternarGuardado(): Promise<void> {
    if (procesandoGuardado) {
      return;
    }

    const articuloId = Number(
      articulo.articulo_id,
    );

    if (
      !Number.isInteger(articuloId) ||
      articuloId <= 0
    ) {
      setErrorGuardado(
        "El artículo no es válido",
      );

      return;
    }

    try {
      setProcesandoGuardado(true);
      setErrorGuardado("");

      if (guardado) {
        await quitarFavorito(
          articuloId,
        );
      } else {
        await guardarFavorito(
          articuloId,
        );
      }

      const nuevoEstado = !guardado;

      setGuardado(nuevoEstado);

      onSavedChange?.(
        articuloId,
        nuevoEstado,
      );
    } catch (errorDesconocido) {
      const mensaje =
        errorDesconocido instanceof Error
          ? errorDesconocido.message
          : "No se pudo actualizar el artículo guardado";

      setErrorGuardado(mensaje);

      if (
        mensaje.includes(
          "iniciar sesión",
        ) ||
        mensaje.includes(
          "sesión guardada",
        )
      ) {
        navigate("/login");
      }
    } finally {
      setProcesandoGuardado(false);
    }
  }

  return (
    <article className="product-card">
      <div className="product-card__image-container">
        {articulo.imagen_principal ? (
          <img
            src={articulo.imagen_principal}
            alt={articulo.titulo}
            className="product-card__image"
          />
        ) : (
          <div className="product-card__placeholder">
            {articulo.titulo}
          </div>
        )}

        <span className="product-card__condition">
          {articulo.condicion}
        </span>

        <button
          className={
            guardado
              ? "product-card__favorite product-card__favorite--active"
              : "product-card__favorite"
          }
          type="button"
          disabled={procesandoGuardado}
          aria-label={
            guardado
              ? `Quitar ${articulo.titulo} de guardados`
              : `Guardar ${articulo.titulo}`
          }
          title={
            guardado
              ? "Quitar de guardados"
              : "Guardar artículo"
          }
          onClick={() =>
            void alternarGuardado()
          }
        >
          <Heart
            size={18}
            fill={
              guardado
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      <div className="product-card__content">
        <div className="product-card__price-row">
          <strong className="product-card__price">
            {precioFormateado}
          </strong>

          <span className="product-card__time">
            Hace poco
          </span>
        </div>

        <h2>{articulo.titulo}</h2>

        <div className="product-card__location">
          <MapPin size={14} />

          <span>
            {articulo.ubicacion ??
              "Ubicación no indicada"}
          </span>
        </div>

        {errorGuardado && (
          <p
            className="product-card__favorite-error"
            role="alert"
          >
            {errorGuardado}
          </p>
        )}

        <div className="product-card__footer">
          <div className="product-card__seller">
            <span className="product-card__seller-avatar">
              <UserRound size={14} />
            </span>

            <span>
              {articulo.vendedor ??
                "Vendedor"}
            </span>
          </div>

          <button
            type="button"
            onClick={abrirDetalle}
          >
            Ver producto
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;