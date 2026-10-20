import { useEffect, useReducer } from 'react';
import { PARAMETROS_INICIALES } from './presupuestoUtils';

const CLAVE = 'viajes.presupuesto.v1';

export const ESTADO_INICIAL = {
  moneda: 'USD',
  presupuestoTotal: 0,
  viajeros: 1,
  dias: 7,
  parametros: PARAMETROS_INICIALES,
  items: [],
};

function cargar(base) {
  try {
    const raw = localStorage.getItem(CLAVE);

    if (!raw) return base;

    return {
      ...base,
      ...JSON.parse(raw),
    };
  } catch {
    return base;
  }
}

function reducer(state, accion) {
  switch (accion.type) {
    case 'CAMPO':
      return {
        ...state,
        [accion.campo]: accion.valor,
      };

    case 'PARAMETRO':
      return {
        ...state,
        parametros: {
          ...state.parametros,
          [accion.campo]: accion.valor,
        },
      };

    case 'AGREGAR':
      return {
        ...state,
        items: [
          ...state.items,
          accion.item,
        ],
      };

    case 'ELIMINAR':
      return {
        ...state,
        items: state.items.filter(
          (i) => i.id !== accion.id
        ),
      };

    case 'EDITAR_MONTO':
      return {
        ...state,

        items: state.items.map((i) =>
          i.id === accion.id
            ? {
                ...i,
                monto: accion.monto,
              }
            : i
        ),
      };

    case 'APLICAR_SIMULACION':
      // Reemplaza solo lo simulado y conserva los gastos manuales.
      return {
        ...state,

        items: [
          ...accion.items,

          ...state.items.filter(
            (i) => i.origen !== 'simulado'
          ),
        ],
      };

    case 'CAMBIAR_MONEDA': {
      const factor = Number(accion.factor);

      if (
        !Number.isFinite(factor) ||
        factor <= 0
      ) {
        return state;
      }

      return {
        ...state,

        moneda: accion.moneda,

        presupuestoTotal:
          Math.round(
            state.presupuestoTotal *
              factor *
              100
          ) / 100,

        items: state.items.map((i) => ({
          ...i,

          monto:
            Math.round(
              (Number(i.monto) || 0) *
                factor *
                100
            ) / 100,
        })),
      };
    }

    case 'LIMPIAR':
      return {
        ...state,
        items: [],
      };

    default:
      return state;
  }
}

/**
 * Estado del presupuesto con persistencia en LocalStorage.
 */
export function usePresupuesto(inicial = {}) {
  const [state, dispatch] = useReducer(
    reducer,
    {
      ...ESTADO_INICIAL,
      ...inicial,
    },
    cargar
  );

  useEffect(() => {
    try {
      localStorage.setItem(
        CLAVE,
        JSON.stringify(state)
      );
    } catch {
      /* almacenamiento no disponible: se ignora */
    }
  }, [state]);

  return [state, dispatch];
}