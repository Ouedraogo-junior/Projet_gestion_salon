<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE transferts_stock DROP CONSTRAINT IF EXISTS transferts_stock_type_transfert_check");
        DB::statement("
            ALTER TABLE transferts_stock 
            ADD CONSTRAINT transferts_stock_type_transfert_check 
            CHECK (type_transfert IN (
                'vente_vers_utilisation', 
                'utilisation_vers_vente',
                'reserve_vers_vente',
                'reserve_vers_utilisation',
                'vente_vers_reserve',
                'utilisation_vers_reserve'
            ))
        ");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE transferts_stock DROP CONSTRAINT IF EXISTS transferts_stock_type_transfert_check");
        DB::statement("
            ALTER TABLE transferts_stock 
            ADD CONSTRAINT transferts_stock_type_transfert_check 
            CHECK (type_transfert IN ('vente_vers_utilisation', 'utilisation_vers_vente'))
        ");
    }
};