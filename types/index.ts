export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type RentalStatus =
  | "pending_payment"
  | "pending"
  | "approved"
  | "rejected"
  | "returned"
  | "completed";

export type PaymentStatus = "unpaid" | "paid" | "refunded";

export type ItemCategory = "uniform" | "graduation" | "cosplay" | "other";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string | null;
          location: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string | null;
          location?: string | null;
          created_at?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string | null;
          location?: string | null;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          owner_id: string;
          title: string;
          description: string;
          category: ItemCategory;
          size: string;
          images: string[];
          handover_days: number;
          deposit_amount: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          category: ItemCategory;
          size: string;
          images?: string[];
          handover_days?: number;
          deposit_amount: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          category?: ItemCategory;
          size?: string;
          images?: string[];
          handover_days?: number;
          deposit_amount?: number;
          is_active?: boolean;
        };
        Relationships: [];
      };
      availabilities: {
        Row: {
          id: string;
          item_id: string;
          start_date: string;
          end_date: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          start_date: string;
          end_date: string;
        };
        Update: {
          start_date?: string;
          end_date?: string;
        };
        Relationships: [];
      };
      rentals: {
        Row: {
          id: string;
          item_id: string;
          borrower_id: string;
          start_date: string;
          end_date: string;
          status: RentalStatus;
          message: string | null;
          deposit_amount: number;
          payment_key: string | null;
          payment_status: PaymentStatus;
          created_at: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          borrower_id: string;
          start_date: string;
          end_date: string;
          status?: RentalStatus;
          message?: string | null;
          deposit_amount: number;
          payment_key?: string | null;
          payment_status?: PaymentStatus;
          created_at?: string;
        };
        Update: {
          status?: RentalStatus;
          payment_key?: string | null;
          payment_status?: PaymentStatus;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Item = Database["public"]["Tables"]["items"]["Row"];
export type Availability = Database["public"]["Tables"]["availabilities"]["Row"];
export type Rental = Database["public"]["Tables"]["rentals"]["Row"];
