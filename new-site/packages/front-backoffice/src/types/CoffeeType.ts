export interface CoffeeType {
  /**
   * Identificador único do Coffee / Pacote
   */
  id: string;

  /**
   * Nome do Coffee (ex: "Coffee Break - Dia 1", "Pacote Completo Coffee")
   */
  name: string;

  /**
   * Descrição opcional contendo itens inclusos ou detalhes
   */
  description?: string;

  /**
   * Valor ou preço do Coffee Break
   */
  price?: number;

  /**
   * Data de criação ou data vinculada ao evento/dia do Coffee (formato ISO/String)
   */
  date?: string;
}
