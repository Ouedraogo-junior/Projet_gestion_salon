<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE mouvements_stock DROP CONSTRAINT IF EXISTS mouvements_stock_type_stock_check");
        DB::statement("
            ALTER TABLE mouvements_stock 
            ADD CONSTRAINT mouvements_stock_type_stock_check 
            CHECK (type_stock IN ('vente', 'utilisation', 'reserve'))
        ");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE mouvements_stock DROP CONSTRAINT IF EXISTS mouvements_stock_type_stock_check");
        DB::statement("
            ALTER TABLE mouvements_stock 
            ADD CONSTRAINT mouvements_stock_type_stock_check 
            CHECK (type_stock IN ('vente', 'utilisation'))
        ");
    }
};