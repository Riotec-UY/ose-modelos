/**
 * Exactly<T, U>
 *
 * Utility type para garantizar type-safety entre interfaces de modelos
 * y clases de Mongoose schemas.
 *
 * Uso:
 * ```typescript
 * @Schema()
 * export class Cliente implements Exactly<ICliente, Cliente> {
 *   _id: string;
 *   nombre: string;
 *   // ... resto de campos
 * }
 * ```
 *
 * Esto asegura que:
 * - La clase tiene EXACTAMENTE los mismos campos que la interfaz
 * - Los tipos de cada campo coinciden
 * - TypeScript reportará errores en compile-time si hay discrepancias
 */
export type Exactly<T, U> = {
  [K in keyof U]: K extends keyof T ? T[K] : never;
};
