<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE produits DROP CONSTRAINT IF EXISTS produits_type_stock_principal_check");
        DB::statement("ALTER TABLE produits ADD CONSTRAINT produits_type_stock_principal_check CHECK (type_stock_principal IN ('vente', 'utilisation', 'mixte', 'reserve'))");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE produits DROP CONSTRAINT IF EXISTS produits_type_stock_principal_check");
        DB::statement("ALTER TABLE produits ADD CONSTRAINT produits_type_stock_principal_check CHECK (type_stock_principal IN ('vente', 'utilisation', 'mixte'))");
    }
};