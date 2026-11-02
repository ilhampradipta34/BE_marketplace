<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::factory()->create([
            'name' => 'Admin Marketplace',
            'email' => 'admin@example.com',
            'password' => 'password',
        ]);
        foreach (range(1, 15) as $i) {
            Product::create(['product_code' => sprintf('PRD-%03d', $i), 'name' => ['Hydrococo', 'Kopi Susu', 'Teh Melati'][$i % 3]." Produk $i", 'variant' => ['150ml', '250ml', '500ml'][$i % 3], 'price' => 10000 + $i * 1500, 'stock' => 20]);
        }
        foreach (range(1, 10) as $i) {
            Customer::create(['name' => "Pelanggan $i", 'email' => "pelanggan$i@example.com", 'phone' => "0812345678$i"]);
        }
    }
}
