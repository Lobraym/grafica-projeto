export interface ProductGroup {
  readonly id: string;
  readonly name: string;
  /**
   * Hex no formato #RRGGBB
   * Ex.: #0F9B7A (teal)
   */
  readonly colorHex: string;
  /**
   * Emoji livre para o grupo (1 emoji ou string curta).
   */
  readonly iconEmoji: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface ProductGroupInput {
  readonly id?: string;
  readonly name: string;
  readonly colorHex: string;
  readonly iconEmoji: string;
}

