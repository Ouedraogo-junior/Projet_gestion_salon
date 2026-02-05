<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Salon;

class SalonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer un salon principal
        Salon::create([
            'nom' => 'Fasodreadlocks',
            'adresse' => 'Ouagadougou, Burkina Faso',
            'telephone' => '12345678',
            'email' => 'contact@fasodreadlocks.com',
            'horaires' => 'Lun-Ven: 09h-18h, Sam: 10h-16h',
            'logo_url' => null,
        ]);
    }
}
