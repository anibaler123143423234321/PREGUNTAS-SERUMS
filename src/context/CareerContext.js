import { createContext, useContext } from 'react';
import { CAREERS } from '../data/careers';

// Carrera SERUMS elegida por el usuario (disponible en toda la app)
export const CareerContext = createContext(CAREERS.medicina);

export function useCareer() {
  return useContext(CareerContext);
}
