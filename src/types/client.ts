import type { PersonType } from './common';

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Client {
  readonly id: string;
  name: string;
  personType: PersonType;
  cpfCnpj: string;
  phone: string;
  email: string;
  address: Address;
  notes: string;
  createdAt: string;
}

export interface ClientFormData {
  name: string;
  personType: PersonType;
  cpfCnpj: string;
  phone: string;
  email: string;
  address: Address;
  notes: string;
}
