<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $users = [
            // Gérant
            [
                'nom' => 'Ouedraogo',
                'prenom' => 'Moussa',
                'telephone' => '+22670123456',
                'email' => 'moussa.ouedraogo@salon.bf',
                'password' => Hash::make('123456'),
                'role' => 'gerant',
                'photo_url' => null,
                'specialite' => null,
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Gestionnaires
            [
                'nom' => 'Sawadogo',
                'prenom' => 'Awa',
                'telephone' => '+22670234567',
                'email' => 'awa.sawadogo@salon.bf',
                'password' => Hash::make('234567'),
                'role' => 'gestionnaire',
                'photo_url' => null,
                'specialite' => null,
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            // Coiffeurs
            [
                'nom' => 'Kaboré',
                'prenom' => 'Ibrahim',
                'telephone' => '+22670345678',
                'email' => 'ibrahim.kabore@salon.bf',
                'password' => Hash::make('345678'),
                'role' => 'coiffeur',
                'photo_url' => null,
                'specialite' => 'Coupes modernes et dégradés',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Traoré',
                'prenom' => 'Fatima',
                'telephone' => '+22670456789',
                'email' => 'fatima.traore@salon.bf',
                'password' => Hash::make('456789'),
                'role' => 'coiffeur',
                'photo_url' => null,
                'specialite' => 'Coiffure féminine et tresses',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Zongo',
                'prenom' => 'Abdoul',
                'telephone' => '+22670567890',
                'email' => 'abdoul.zongo@salon.bf',
                'password' => Hash::make('567890'),
                'role' => 'coiffeur',
                'photo_url' => null,
                'specialite' => 'Barbe et rasage traditionnel',
                'is_active' => true,
                'email_verified_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'nom' => 'Compaoré',
                'prenom' => 'Aminata',
                'telephone' => '+22670678901',
                'email' => null,
                'password' => Hash::make('678901'),
                'role' => 'coiffeur',
                'photo_url' => null,
                'specialite' => 'Extensions et tissages',
                'is_active' => true,
                'email_verified_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('users')->insert($users);
    }
}